from skeleton_utils import *
from scipy.signal import argrelmin
UPPER_BODY_EXERCISES = ["arm-clap", "biceps-curl", "tricep-extension", "front-raise"]
LOWER_BODY_EXERCISES = ["deadlift", "double-lunge", "squat"]

# Individua le ripetizioni nei vari esercizi
def euclidean_identify_repetitions(user, exercise):
    distances = []
    if exercise in UPPER_BODY_EXERCISES:
        ref_sk = upper_body(open_skeleton("../upload/" + user + "/NormalizedSkeletons/normalized_skeleton_frame0.pkl"))
        for frame in range(len(os.listdir("../upload/" + user + "/NormalizedSkeletons"))):
            skeleton = upper_body(open_skeleton("../upload/" + user + "/NormalizedSkeletons/normalized_skeleton_frame" + str(frame * 5) + ".pkl"))
            distances.append(np.linalg.norm(ref_sk - skeleton))
    elif exercise in LOWER_BODY_EXERCISES:
        ref_sk = lower_body(open_skeleton("../upload/" + user + "/NormalizedSkeletons/normalized_skeleton_frame0.pkl"))
        for frame in range(len(os.listdir("../upload/" + user + "/NormalizedSkeletons"))):
            skeleton = lower_body(open_skeleton("../upload/" + user + "/NormalizedSkeletons/normalized_skeleton_frame" + str(frame * 5) + ".pkl"))
            distances.append(np.linalg.norm(ref_sk - skeleton))
    else:
        ref_sk = open_skeleton("../upload/" + user + "/NormalizedSkeletons/normalized_skeleton_frame0.pkl")["joint_coordinates"]
        for frame in range(len(os.listdir("../upload/" + user + "/NormalizedSkeletons"))):
            skeleton = open_skeleton("../upload/" + user + "/NormalizedSkeletons/normalized_skeleton_frame" + str(frame * 5) + ".pkl")["joint_coordinates"]
            distances.append(np.linalg.norm(ref_sk - skeleton))

    candidate_PoI = []
    PoI = [(0, 0)]
    thr = np.mean(np.array(distances))
    for i in range(len(distances)):
        if distances[i] <= thr:
            candidate_PoI.append(i*5)
    i=0
    while i < len(candidate_PoI):
        temp = []
        j=0
        while i+j+1 < len(candidate_PoI) and candidate_PoI[i+j+1]-candidate_PoI[i+j] <= 10:
            temp.append(candidate_PoI[i+j])
            j += 1
        temp.append(candidate_PoI[i+j])
        if len(temp) > 1:
            previous_el = int(PoI[len(PoI)-1][1])
            PoI.append((previous_el, temp[int(len(temp)/2)]))  #aggiungo alla lista PoI l'intervallo di una certa ripetizione (0-50, 50-90, ecc...)
            i += j
        else:
            previous_el = int(PoI[len(PoI) - 1][1])
            PoI.append((previous_el, temp[0]))
        i += 1
    PoI.pop(0)
    if PoI[0][1] <= 30:   #vincolo che evita che il primo punto di interesse sia preso entro un secondo dall'inizio dell'esercizio
        PoI.pop(0)
        PoI[0] = (0, PoI[0][1])
    if len(PoI) > 1:
        PoI.pop(len(PoI)-1)
    previous_el = int(PoI[len(PoI) - 1][1])
    PoI.append((previous_el, len(os.listdir("../upload/" + user + "/NormalizedSkeletons")) * 5 - 5))
    return PoI


def trainer_identify_repetitions(exercise):  # identify repetitions through euclidean distance
    distances = []
    if exercise in UPPER_BODY_EXERCISES:
        ref_sk = upper_body(open_skeleton("../trainer/"+ exercise + "/NormalizedSkeletons/normalized_skeleton_frame0.pkl"))
        for frame in range(len(os.listdir("../trainer/" + exercise + "/NormalizedSkeletons"))):
            skeleton = upper_body(open_skeleton("../trainer/" + exercise + "/NormalizedSkeletons/normalized_skeleton_frame" + str(frame * 5) + ".pkl"))
            distances.append(np.linalg.norm(ref_sk - skeleton))
    elif exercise in LOWER_BODY_EXERCISES:
        ref_sk = lower_body(open_skeleton("../trainer/" + exercise + "/NormalizedSkeletons/normalized_skeleton_frame0.pkl"))
        for frame in range(len(os.listdir("../trainer/" + exercise + "/NormalizedSkeletons"))):
            skeleton = lower_body(open_skeleton("../trainer/" + exercise + "/NormalizedSkeletons/normalized_skeleton_frame" + str(frame * 5) + ".pkl"))
            distances.append(np.linalg.norm(ref_sk - skeleton))
    else:
        ref_sk = open_skeleton("../trainer/" + exercise + "/NormalizedSkeletons/normalized_skeleton_frame0.pkl")["joint_coordinates"]
        for frame in range(len(os.listdir("../trainer/" + exercise + "/NormalizedSkeletons"))):
            skeleton = open_skeleton("../trainer/" + exercise + "/NormalizedSkeletons/normalized_skeleton_frame" + str(frame * 5) + ".pkl")["joint_coordinates"]
            distances.append(np.linalg.norm(ref_sk - skeleton))

    candidate_PoI = []
    PoI = [(0, 0)]
    thr = np.mean(np.array(distances))
    for i in range(len(distances)):
        if distances[i] <= thr:
            candidate_PoI.append(i*5)
    i=0
    while i < len(candidate_PoI):
        temp = []
        j=0
        while i+j+1 < len(candidate_PoI) and candidate_PoI[i+j+1]-candidate_PoI[i+j] <= 10:
            temp.append(candidate_PoI[i+j])
            j += 1
        temp.append(candidate_PoI[i+j])
        if len(temp) > 1:
            previous_el = int(PoI[len(PoI)-1][1])
            PoI.append((previous_el, temp[int(len(temp)/2)]))  #aggiungo alla lista PoI l'intervallo di una certa ripetizione (0-50, 50-90, ecc...)
            i += j
        else:
            previous_el = int(PoI[len(PoI) - 1][1])
            PoI.append((previous_el, temp[0]))
        i += 1
    PoI.pop(0)
    if PoI[0][1] <= 60:   #vincolo che evita che il primo punto di interesse sia preso entro un secondo dall'inizio dell'esercizio
        PoI.pop(0)
        PoI[0] = (0, PoI[0][1])
    if len(PoI) > 1:
        PoI.pop(len(PoI)-1)
    previous_el = int(PoI[len(PoI) - 1][1])
    PoI.append((previous_el, len(os.listdir("../trainer/" + exercise + "/NormalizedSkeletons")) * 5 - 5))
    return PoI

def user_identify_repetitions(user, exercise):
    distances = []
    if exercise in UPPER_BODY_EXERCISES:
        ref_sk = upper_body(open_skeleton("../trainer/" + exercise + "/NormalizedSkeletons/normalized_skeleton_frame0.pkl"))
        for frame in range(len(os.listdir("../upload/" + user + "/NormalizedSkeletons"))):
            skeleton = upper_body(open_skeleton("../upload/" + user + "/NormalizedSkeletons/normalized_skeleton_frame" + str(frame * 5) + ".pkl"))
            distances.append(np.linalg.norm(ref_sk - skeleton))
    elif exercise in LOWER_BODY_EXERCISES:
        ref_sk = lower_body(open_skeleton("../trainer/" + exercise + "/NormalizedSkeletons/normalized_skeleton_frame0.pkl"))
        for frame in range(len(os.listdir("../upload/" + user + "/NormalizedSkeletons"))):
            skeleton = lower_body(open_skeleton("../upload/" + user + "/NormalizedSkeletons/normalized_skeleton_frame" + str(frame * 5) + ".pkl"))
            distances.append(np.linalg.norm(ref_sk - skeleton))
    else:
        ref_sk = open_skeleton("../trainer/" + exercise + "/NormalizedSkeletons/normalized_skeleton_frame0.pkl")["joint_coordinates"]
        for frame in range(len(os.listdir("../upload/" + user + "/NormalizedSkeletons"))):
            skeleton = open_skeleton("../upload/" + user + "/NormalizedSkeletons/normalized_skeleton_frame" + str(frame * 5) + ".pkl")["joint_coordinates"]
            distances.append(np.linalg.norm(ref_sk - skeleton))

    candidate_PoI = []
    PoI = [(0, 0)]
    thr = np.mean(np.array(distances)) * 0.75
    for i in range(len(distances)):
        if distances[i] <= thr:
            candidate_PoI.append(i * 5)
    i=0
    while i < len(candidate_PoI):
        temp = []
        j=0
        while i+j+1 < len(candidate_PoI) and candidate_PoI[i+j+1]-candidate_PoI[i+j] <= 10:
            temp.append(candidate_PoI[i+j])
            j += 1
        temp.append(candidate_PoI[i+j])
        if len(temp) > 1:
            previous_el = int(PoI[len(PoI)-1][1])
            PoI.append((previous_el, temp[int(len(temp)/2)]))  #aggiungo alla lista PoI l'intervallo di una certa ripetizione (0-50, 50-90, ecc...)
            i += j
        else:
            previous_el = int(PoI[len(PoI) - 1][1])
            PoI.append((previous_el, temp[0]))
        i += 1
    PoI.pop(0)
    PoI.pop(0)
    if len(PoI) > 1:
        PoI.pop(len(PoI)-1)
    previous_el = int(PoI[len(PoI) - 1][1])
    PoI.append((previous_el, len(os.listdir("../upload/" + user + "/NormalizedSkeletons")) * 5 - 5))
    return PoI