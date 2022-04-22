import json
import os
import time
import numpy as np
import matplotlib.pyplot as plt
from natsort import os_sorted
import tensorflow as tf
import skimage.data
import skimage.transform
import skimage.io
import pickle as pkl
import errno
import stat
import shutil

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '1'
"""
0 = all messages are logged (default behavior)
1 = INFO messages are not printed
2 = INFO and WARNING messages are not printed
3 = INFO, WARNING, and ERROR messages are not printed
"""

########## Some Variables Definitions  ######
MODEL_PATH = "../models/"
MODEL_NAME = "metrabs_mob3l_y4"

human_readable = {b'pelv': "pelvis", b'lhip': "left hip", b'rhip': "right hip", b'spi1': "spine naval", b'lkne': "left knee", b'rkne': "right knee", b'spi2': "spine chest", b'lank': "left ankle",
                  b'rank': "right ankle", b'spi3': "spine chest", b'ltoe': "left foot", b'rtoe': "right foot", b'neck': "neck", b'lcla': "left clavicle", b'rcla': "right clavivle", b'head': "head", b'lsho': "left shoulder",
                  b'rsho': "right shoulder", b'lelb': "left elbow", b'relb': "right elbow", b'lwri': "left wrist", b'rwri': "right wrist", b'lhan': "left hand", b'rhan': "right hand"}


class SkeletonGenerator:
    def __init__(self, model_path=MODEL_PATH, model_name=MODEL_NAME):
        start_time = time.time()
        self.model = tf.saved_model.load(model_path + model_name)
        print("Model loading time: %s s" % (time.time() - start_time))

    def full_pipeline(self, user):
        start_time = time.time()
        self.generate_from_directory(user)
        print("Skeleton GENERATED in: %s s" % (time.time() - start_time))

        start_time = time.time()
        self.fix_skeletons(user)
        print("Skeleton FIXED in: %s s" % (time.time() - start_time))

        start_time = time.time()
        self.normalize_directory(user)
        print("Skeletons NORMALIZED in: %s s" % (time.time() - start_time))

        start_time = time.time()
        self.regularize_skeleton(user)
        print("Skeletons REGULARIZED in: %s s" % (time.time() - start_time))

    def generate_from_directory(self, user):
        os.makedirs("../upload/" + user + "/Skeletons", exist_ok=True)
        images = tf.stack([tf.image.decode_jpeg(tf.io.read_file("../upload/" + user + "/Frames/frame0.jpg"))], axis=0)
        for frame in range(1, len(os.listdir("../upload/" + user + "/Frames"))):
            images = tf.concat([images, [tf.image.decode_jpeg(tf.io.read_file("../upload/" + user + "/Frames/frame" + str(frame * 5) + ".jpg"))]], axis=0)
        dictionary = self.model.detect_poses_batched(images, skeleton="smpl_24")

        for i in range(len(images)):
            if dictionary["poses3d"][i].numpy().size == 0:
                with open("../upload/" + user + "/SkeletonsNonRiusciti.txt", "a+") as file:
                    file.write("frame" + str(i * 5) + ".jpg\n")
            else:
                skeleton = {
                    "joint_coordinates": dictionary["poses3d"][i].numpy()[0],
                    "joint_2d_coordinates": dictionary["poses2d"][i].numpy()[0],
                    "edges": self.model.per_skeleton_joint_edges['smpl_24'].numpy(),
                    "joint_names": self.model.per_skeleton_joint_names['smpl_24'].numpy()
                }
                with open("../upload/" + user + "/Skeletons/skeleton_frame" + str(i * 5) + ".pkl", "wb") as skf:
                    pkl.dump(skeleton, skf)

    def fix_skeletons(self, user, frame_range=1):
        if not os.path.exists("../upload/" + user + "/SkeletonsNonRiusciti.txt"):
            return
        with open("../upload/" + user + "/SkeletonsNonRiusciti.txt", "r") as file:
            for line in file:
                frame = line.replace("\n", "")
                frames_list = os_sorted(os.listdir("../upload/" + user + "/Frames"))
                frame_in_frames_list = frames_list.index(frame)
                if frame_in_frames_list != 0 and frame_in_frames_list < len(frames_list):
                    frames_pool = frames_list[frame_in_frames_list - frame_range: frame_in_frames_list + (frame_range + 1)]
                    i = 1
                    while i <= floor(len(frames_pool) / 2):
                        for sgn in [-1, 1]:
                            idx = floor(len(frames_pool) / 2) + (i * sgn)
                            image = tf.image.decode_jpeg(tf.io.read_file("../upload/" + user + "/Frames/" + frames_pool[idx]))
                            dictionary = self.model.detect_poses(image, skeleton="smpl_24")
                            if dictionary["poses3d"].numpy().size != 0:
                                skeleton = {
                                    "joint_coordinates": dictionary["poses3d"].numpy()[0],
                                    "joint_2d_coordinates": dictionary["poses2d"].numpy()[0],
                                    "edges": self.model.per_skeleton_joint_edges['smpl_24'].numpy(),
                                    "joint_names": self.model.per_skeleton_joint_names['smpl_24'].numpy()
                                }
                                with open("../upload/" + user + "/Skeletons/skeleton_frame" + str(frame) + ".pkl", "wb") as skf:
                                    pkl.dump(skeleton, skf)
                                i = 1000000
                                break
                        i += 1
        if os.path.exists("../upload/" + user + "SkeletonsNonRiusciti.txt"):
            os.remove("../upload/" + user + "SkeletonsNonRiusciti.txt")
        self.rename_skeletons(user)

    def rename_skeletons(self, user):
        os.makedirs("../upload/" + user + "/SkeletonsNew", exist_ok=True)
        frames = os_sorted(os.listdir("../upload/" + user + "/Skeletons"))
        i = 0
        for frame in frames:
            with open("../upload/" + user + "/Skeletons/" + frame, "rb") as f:
                skeleton = pkl.load(f)
            with open("../upload/" + user + "/SkeletonsNew/skeleton_frame" + str(i) + ".pkl", "wb") as f:
                pkl.dump(skeleton, f)
            i += 5
        shutil.rmtree("../upload/" + user + "/Skeletons", ignore_errors=False, onerror=handleRemoveReadonly)
        os.rename("../upload/" + user + "/SkeletonsNew", "../upload/" + user + "/Skeletons")

    def normalize_skeleton(self, skeleton_path, autosave=True, delete_old=False):
        with open(skeleton_path, "rb") as skeleton_file:
            skeleton = pkl.load(skeleton_file)

        center_points = [b'pelv', b'rhip', b'lhip']
        # Estrazione vettore medio fianchi e torso
        mean_vector = np.zeros(dtype='float64', shape=(1, 3))
        for joint_name in center_points:
            index = np.where(skeleton["joint_names"] == joint_name)
            mean_vector += skeleton["joint_coordinates"][index]
        mean_vector = mean_vector / len(center_points)
        mean_vector = np.reshape(mean_vector, (3,))

        #  Normalizzazione vettore dei joints (centramento sul baricentro e normalizzazione)
        for joint in skeleton["joint_coordinates"]:
            joint -= mean_vector
        skeleton["joint_coordinates"] = skeleton["joint_coordinates"] / np.linalg.norm(skeleton["joint_coordinates"])

        # Calcolo matrice M per la normalizzazione dell'inquadratura
        Jhl = np.transpose(skeleton["joint_coordinates"][np.where(skeleton["joint_names"] == b'lcla')])
        Jt = np.transpose(skeleton["joint_coordinates"][np.where(skeleton["joint_names"] == b'rcla')])
        Jhl = Jhl / np.linalg.norm(Jhl)
        norm2 = np.linalg.norm(Jhl)
        tras = np.transpose(Jhl)
        temp = np.dot((tras / norm2), Jt).item()
        Jhl_ort = Jt - (temp * Jhl)

        Jhl_ort = Jhl_ort / np.linalg.norm(Jhl_ort)
        cross_product_vector = np.cross(Jhl, Jhl_ort, axis=0)

        cross_product_vector = cross_product_vector / np.linalg.norm(cross_product_vector)
        M = np.concatenate((Jhl, Jhl_ort, cross_product_vector), axis=1)
        x_tilde = np.transpose(skeleton["joint_coordinates"])
        x_tilde = np.dot(np.transpose(M), x_tilde)
        skeleton["joint_coordinates"] = np.transpose(x_tilde)

        if autosave:
            if os.path.exists(skeleton_path) and delete_old:
                os.remove(skeleton_path)
            skeleton_path = skeleton_path.replace("skeleton", "normalized_skeleton")
            skeleton_path = skeleton_path.replace("Skeletons", "NormalizedSkeletons")
            with open(skeleton_path, "wb") as skeleton_file:
                pkl.dump(skeleton, skeleton_file)
        return skeleton

    def normalize_directory(self, user):
        os.makedirs("../upload/" + user + "/NormalizedSkeletons", exist_ok=True)
        for frame in os_sorted(os.listdir("../upload/" + user + "/Skeletons/")):
            self.normalize_skeleton("../upload/" + user + "/Skeletons/" + frame, autosave=True, delete_old=False)

    def regularize_skeleton(self, user, SW_size=5, autosave=False):
        weights = np.ones(shape=(SW_size - 1,))
        for i in range(int(len(weights) / 2)):
            weights[i] = 1 / (2 ** (int(len(weights) / 2) - i))
        for i in range(int(len(weights) / 2), len(weights)):
            weights[i] = 1 / (2 ** (i - int((len(weights) / 2) - 1)))
        sliding_window = []
        copy = []
        for i in range(SW_size):
            sk = open_skeleton("../upload/" + user + "/NormalizedSkeletons/normalized_skeleton_frame" + str(i * 5) + ".pkl")
            sliding_window.append(sk)
            copy.append(sk["joint_coordinates"])

        for idx in range(int(SW_size / 2), len(os.listdir("../upload/" + user + "/NormalizedSkeletons/")) - int(SW_size / 2)):
            copy = []
            for i in range(SW_size):
                if i != int(SW_size / 2) + 1:
                    copy.append(sliding_window[i]["joint_coordinates"])
            copy = [copy[i] * weights[i] for i in range(len(weights))]

            for joint in range(sliding_window[0]["joint_coordinates"].shape[0]):
                copy = np.array(copy)
                mean_joint = copy[0:, joint]
                mean = sum(mean_joint) / sum(weights)
                diff = np.absolute(mean - (sliding_window[int(SW_size / 2)]["joint_coordinates"][joint]))
                tollerance = np.absolute(mean * 2)
                if (diff > tollerance).any():
                    sliding_window[int(SW_size / 2)]["joint_coordinates"][joint] = mean
                    if autosave:
                        with open("../upload/" + user + "/NormalizedSkeletons/normalized_skeleton_frame" + str(idx * 5) + ".pkl", "wb") as skf:
                            pkl.dump(sliding_window[int(SW_size / 2)], skf)
            sliding_window.pop(0)
            if idx + 3 >= len(os.listdir("../upload/" + user + "/NormalizedSkeletons")):
                return
            sliding_window.append(open_skeleton("../upload/" + user + "/NormalizedSkeletons/normalized_skeleton_frame" + str((idx + 3) * 5) + ".pkl"))


def image_to_numpy(image_path, dimensions=(256, 256)):
    # Load the image from image_path
    image = skimage.io.imread(image_path)
    image_numpy = np.stack([skimage.transform.resize(image, dimensions)])
    return image_numpy


def handleRemoveReadonly(func, path, exc):
    excvalue = exc[1]
    if func in (os.rmdir, os.remove) and excvalue.errno == errno.EACCES:
        os.chmod(path, stat.S_IRWXU | stat.S_IRWXG | stat.S_IRWXO)
        func(path)
    else:
        raise


def upper_body(skeleton, sphere=False, two_dim=False):
    coords = list(range(12, 24))
    if sphere:
        return skeleton["sphere_coordinates"][coords]
    if two_dim:
        return skeleton["joint_2d_coordinates"][coords]
    return skeleton["joint_coordinates"][coords]


def upper_body_names(skeleton):
    coords = list(range(12, 24))
    return skeleton["joint_names"][coords]


def lower_body(skeleton, sphere=False, two_dim=False):
    coords = list(range(12))
    if sphere:
        return skeleton["sphere_coordinates"][coords]
    if two_dim:
        return skeleton["joint_2d_coordinates"][coords]
    return skeleton["joint_coordinates"][coords]


def lower_body_names(skeleton):
    coords = list(range(12))
    return skeleton["joint_names"][coords]


def find_coord(skeleton, name):
    return skeleton["joint_coordinates"][np.where(name == skeleton["joint_names"])]


def find_2d_coord(skeleton, name):
    return skeleton["joint_2d_coordinates"][np.where(name == skeleton["joint_names"])]


def is_ort(P1, P2):
    if np.inner(np.transpose(P1), np.transpose(P2)) <= 0.00001:
        return True
    else:
        return False


def open_skeleton(skeleton_path):
    with open(skeleton_path, "rb") as skeleton_file:
        sk = pkl.load(skeleton_file)
    return sk


def retrieve_sequence(directory, body_part="full"):
    sequence = []
    for frame in os_sorted(directory):
        with open(directory + "/" + frame, "rb") as skeleton_file:
            skeleton = pkl.load(skeleton_file)
            if body_part == "upper":
                sequence.append(upper_body(skeleton))
            elif body_part == "lower":
                sequence.append(lower_body(skeleton))
            else:
                sequence.append(skeleton["joint_coordinates"])
    return sequence


def identify_frame_errors(user, exercise, repetition_distance, thr_multiplier=1.0):
    error_list = []
    repetition_list = []
    distances, trainer_index, user_index = repetition_distance(user, exercise)
    for triple in distances:
        user_repetition_num = triple[1]
        trainer_repetition_num = triple[0]
        path = triple[2][1]
        skeleton_distances = triple[2][2]
        thr = np.mean(skeleton_distances) * thr_multiplier
        for i in range(len(skeleton_distances)):
            if skeleton_distances[i] > thr:
                user_frame = user_index[user_repetition_num][path[i][1]]
                trainer_frame = trainer_index[trainer_repetition_num][path[i][0]]
                error_list.append((trainer_frame, user_frame))
                repetition_list.append(user_repetition_num)

    errors = {"errorNumber": len(error_list),
              "errorList": error_list,  # pairs list that maps user frame errors to the trainer frame used for comparison
              "repetitionList": repetition_list  # list that maps the corrispondence between user repetitions to user repetition
              }
    return errors


def compute_image_errors(user_image_path, error_2d_points):
    user_image = plt.imread(user_image_path)
    fig, ax = plt.subplots()
    ax.imshow(user_image)
    color = [[1, 0, 0]]
    i = 1
    for error in error_2d_points:
        ax.scatter(error[0], error[1], marker='X', c=color, s=100)
        color[0][1] += 1 / (2 ** i)
        i += 1
    os.makedirs(user_image_path.replace(user_image_path[user_image_path.find("Frames/"):], "ErrorImages"), exist_ok=True)
    plt.savefig(user_image_path.replace("Frames", "ErrorImages"))
    plt.close(fig)
    return


import matplotlib
from math import *


def visualize_errors(trainer_sk, user_sk, trainer_image, user_image, error_points, error_2d_points, frame_couple):
    if len(error_points) == 0:
        print("Joint Errors not detected in frame " + str(frame_couple[1]) + "! (Try to set a lower threshold.)")
        return

    rotation_matrix = np.dot(np.dot([[0, 0, 1], [0, 1, 0], [-1, 0, 0]], [[0, 1, 0], [-1, 0, 0], [0, 0, 1]]), [[cos(radians(-10)), 0, sin(radians(-10))], [0, 1, 0], [-sin(radians(-10)), 0, cos(radians(-10))]])

    coords1 = np.dot(trainer_sk["joint_coordinates"], rotation_matrix)
    # coords1 = trainer_sk["joint_coordinates"]
    edges1 = trainer_sk["edges"]
    coords2 = np.dot(user_sk["joint_coordinates"], rotation_matrix)
    # coords2 = user_sk["joint_coordinates"]
    edges2 = user_sk["edges"]
    error_points = np.dot(np.array(error_points), rotation_matrix)
    # error_points = np.array(error_points)

    matplotlib.use('Qt5Agg')
    # noinspection PyUnresolvedReferences
    # from mpl_toolkits.mplot3d import Axes3D

    fig = plt.figure(figsize=(15, 15))

    trainer_image = image_to_numpy(trainer_image)[0]
    image_ax = fig.add_subplot(2, 2, 1)
    image_ax.set_title('\nTRAINER')
    image_ax.imshow(trainer_image)

    user_image = image_to_numpy(user_image)[0]
    image_ax = fig.add_subplot(2, 2, 2)
    image_ax.set_title('\nUSER')
    color = [[1, 0, 0]]
    i = 1
    for error in error_2d_points:
        image_ax.scatter(error[0], error[1], marker='X', c=color, s=100)
        color[0][1] += 1 / (2 ** i)
        i += 1

    image_ax.imshow(user_image)

    pose_ax = fig.add_subplot(2, 2, 3, projection='3d')
    pose_ax.set_title('\nFrame:' + str(frame_couple[0]))
    range_ = np.amax(np.abs(coords1))
    pose_ax.set_xlim3d(-range_, range_)
    pose_ax.set_ylim3d(-range_, range_)
    pose_ax.set_zlim3d(-range_, range_)
    pose_ax.set_ylabel(ylabel='y')
    pose_ax.set_xlabel("x")
    pose_ax.set_zlabel("z")

    for i_start, i_end in edges1:
        pose_ax.plot(*zip(coords1[i_start], coords1[i_end]), marker='o', markersize=2)

    pose_ax.scatter(coords1[:, 0], coords1[:, 1], coords1[:, 2], c='#0000ff', s=2)

    pose_ax = fig.add_subplot(2, 2, 4, projection='3d')
    pose_ax.set_title('\nFrame:' + str(frame_couple[1]))
    range_ = np.amax(np.abs(coords2))
    pose_ax.set_xlim3d(-range_, range_)
    pose_ax.set_ylim3d(-range_, range_)
    pose_ax.set_zlim3d(-range_, range_)
    pose_ax.set_ylabel(ylabel='y')
    pose_ax.set_xlabel("x")
    pose_ax.set_zlabel("z")

    for i_start, i_end in edges2:
        pose_ax.plot(*zip(coords2[i_start], coords2[i_end]), marker='o', markersize=2)

    pose_ax.scatter(coords2[:, 0], coords2[:, 1], coords2[:, 2], c='#0000ff', s=2)
    color = [[1, 0, 0]]
    i = 1
    for error in error_points:
        pose_ax.scatter(error[0], error[1], error[2], marker='X', c=color, s=50)
        color[0][1] += 1 / (2 ** i)
        i += 1
    fig.tight_layout(pad=0.1, h_pad=0.01, w_pad=0.01, rect=(0, 0, 1, 1))

    plt.show()
    return


def visualize_skeleton(skeleton):
    coords = skeleton["joint_coordinates"]
    edges = skeleton['edges']

    plt.switch_backend('TkAgg')
    # noinspection PyUnresolvedReferences
    from mpl_toolkits.mplot3d import Axes3D

    # Matplotlib interprets the Z axis as vertical, but our pose
    # has Y as the vertical axis.
    # Therefore we do a 90 degree rotation around the horizontal (X) axis
    # coords2 = coords.copy()
    # coords[:, 1], coords[:, 2] = coords2[:, 2], -coords2[:, 1]

    fig = plt.figure(figsize=(10, 5))

    pose_ax = fig.add_subplot(1, 1, 1, projection='3d')
    pose_ax.set_title('Prediction')
    range_ = np.amax(np.abs(skeleton["joint_coordinates"]))
    pose_ax.set_xlim3d(-range_, range_)
    pose_ax.set_ylim3d(-range_, range_)
    pose_ax.set_zlim3d(-range_, range_)
    plt.ylabel("y")
    plt.xlabel("x")
    for i_start, i_end in edges:
        pose_ax.plot(*zip(coords[i_start], coords[i_end]), marker='o', markersize=2)

    pose_ax.scatter(coords[:, 0], coords[:, 1], coords[:, 2], s=2)

    fig.tight_layout()
    plt.show()
