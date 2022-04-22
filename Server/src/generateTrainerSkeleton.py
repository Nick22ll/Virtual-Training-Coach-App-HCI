import os

from CombinedDistances import *
from visualize_library import *
from server import *


def main():
    generator = SkeletonGenerator()
    for dir in os.listdir("../trainer"):
        generator.full_pipeline(dir)
        sequences, index = retrieve_sphere_PoI_sequences("trainer", dir)
        with open("../trainer/"+dir+"/sequence.pkl", "wb") as f:
            pkl.dump(sequences, f)
        with open("../trainer/"+dir+"/index.pkl", "wb") as f:
            pkl.dump(index, f)

if __name__ == "__main__":
    main()
