import base64
import os
import socket
import threading
import ssl
from base64 import b64encode
from hashlib import sha1
from math import ceil, floor
from itertools import cycle
from ImagesPreProcessing import pad_dir
from skeleton_utils import *
from CombinedDistances import *

##### SERVER SETTINGS ######
HEADER = 16384
PORT = 8080
SERVER = "0.0.0.0" #socket.gethostbyname(socket.gethostname())

ADDR = (SERVER, PORT)

###### SERVER COMMANDS #######
DISCONNECT_COMMAND = "!DISCONNECT"
CONNECT_COMMAND = "!CONNECT"
IMAGE_COMMAND = "!IMAGE"
EXERCISE_SENT_COMPLETE_COMMAND = "!EXERCISE_COMPLETED"

##### Utility #######
GUID = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11"
FORMAT = 'utf-8'


class bcolors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'


def xor(data, key):
    map(bytearray, [data, key])
    return bytearray(a ^ b for a, b in zip(data, cycle(key)))


class WebServer:
    def __init__(self):
        print(f"{bcolors.OKCYAN}[STARTING]{bcolors.ENDC} Server is loading...")
        context = ssl.SSLContext(ssl.PROTOCOL_SSLv23)
        context.load_cert_chain('../ssl_certificates/serverVTC.crt', '../ssl_certificates/serverVTC.key')
        #sock = socket.create_server(ADDR)
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM, 0)
        sock.bind(ADDR)
        self.address = ADDR
        self.hostname = "VTC_server"
        self.websockets_keys = {}
        self.server = context.wrap_socket(sock, server_side=True)
        self.generator = SkeletonGenerator()

    def decode_first_frame(self, frame):
        payload_length = int(frame[1] - 0x80)  # 0x80 = 128  -> 0xff-0x80 = 255-128 = 127
        if payload_length <= 125:
            decrypt_key = frame[2:6]
            payload = frame[6:(6 + (payload_length + 1))]
        elif payload_length == 126:
            payload_length = int.from_bytes(frame[2:4], byteorder='big', signed=False)
            decrypt_key = frame[4:8]
            payload = frame[8:(8 + (payload_length + 1))]
        elif payload_length == 127:
            payload_length = int.from_bytes(frame[2:10], byteorder='big', signed=False)
            decrypt_key = frame[10:14]
            payload = frame[14:(14 + (payload_length + 1))]
        else:
            return None
        return payload_length, decrypt_key, xor(payload, decrypt_key).decode(FORMAT)

    def receive_msg(self, conn):
        frame = conn.recv(HEADER)
        if len(frame) == 0:
            return None
        msg_total_length, decrypt_key, decoded_msg = self.decode_first_frame(frame)
        for i in range(ceil(msg_total_length / HEADER) - 1):
            frame = conn.recv(HEADER)
            decoded_msg = decoded_msg + xor(frame, decrypt_key).decode(FORMAT)
        return decoded_msg

    def communication_pipeline(self, conn, addr):
        if self.handshake(conn, addr):
            self.handle_client(conn, addr)
        else:
            print(f"{bcolors.WARNING}[HANDSHAKE FAILED] {bcolors.ENDC}{addr}")
            conn.close()

    def handshake(self, conn, addr):
        print(f"{bcolors.OKCYAN}[NEW CONNECTION TRY] {bcolors.ENDC}{addr}")
        msg = conn.recv(HEADER).decode(FORMAT)
        key = msg[msg.find("Sec-WebSocket-Key: ") + 19: msg.find("==") + 2]
        self.websockets_keys[addr[0] + str(addr[1])] = b64encode(sha1((key + GUID).encode()).digest())
        handshake_message = b"HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: " + self.websockets_keys[addr[0] + str(addr[1])] + b"\r\n\r\n"
        conn.send(handshake_message)
        msg = self.receive_msg(conn)
        if msg == CONNECT_COMMAND:
            print(f"{bcolors.OKGREEN}[NEW CONNECTION] {bcolors.ENDC}{addr}")
            return True
        return False

    def send_message(self, conn, msg):
        max_payload_lenght = HEADER - 2
        first_packet_flag = True
        while msg:
            to_send = [0x00, 126]  # Create the packet header: 0x00= Continuation Frame; 126= extend length;   CONTINUATION FRAME of size 4096
            if first_packet_flag:
                if len(msg) < max_payload_lenght:
                    to_send = [0x81, 126]  # Create the packet header: 0x01= FINAL TEXT Frame; 126= extend length;   SINGLE PACKET of size < 4096, type text
                else:
                    to_send = [0x01, 126]  # Create the packet header: 0x01= CONTINUATION TEXT Frame; 126= extend length;  FIRST PACKET of size 4096, type text
                first_packet_flag = False
            else:
                if len(msg) < max_payload_lenght:
                    to_send = [0x80, 126]  # Create the packet header: 0x80= FINAL Frame; 126= extend length;  FINAL PACKET of size < 4096
            payload = msg[:max_payload_lenght]
            msg = msg[max_payload_lenght:]
            to_send = to_send + list(len(payload).to_bytes(2, byteorder='big'))
            to_send = to_send + list(map(ord, payload))
            print(payload)
            conn.send(bytearray(to_send))

    def handle_client(self, conn, addr):
        try:
            connected = True
            while connected:
                msg = self.receive_msg(conn)
                command = msg[:msg.find('$')]
                option = msg[msg.find('$') + 1:]
                print(f"[{addr}]: {bcolors.BOLD}{command}{bcolors.ENDC} option: {option}")
                if command == DISCONNECT_COMMAND or None:
                    connected = False
                elif command == IMAGE_COMMAND:
                    self.receive_image(conn, addr, option)
                elif command == EXERCISE_SENT_COMPLETE_COMMAND:
                    username = str(addr[0]) + "_" + str(addr[1])
                    option = json.loads(option)
                    exercise = option["exercise"].replace(" ", "-").lower()
                    pad_dir("../upload/" + username + "/Frames")
                    self.generator.full_pipeline(username)
                    json_results = json.dumps(identify_combined_errors(username, exercise, repetitions_combined_distance, frame_thr_multiplier=int(option["frame_thr"]), joint_thr_multiplier=int(option["joint_thr"])))
                    self.send_message(conn, json_results)
                else:
                    continue
            conn.close()
            print(f"{bcolors.OKBLUE}[CONNECTION CLOSED] {bcolors.ENDC}{addr} by message.")
        except ():
            conn.close()
            print(f"{bcolors.WARNING}[CONNECTION CLOSED] {bcolors.ENDC}{addr}")

    def receive_image(self, conn, addr, lenght):
        final_msg = ""
        for i in range(int(lenght)):
            final_msg = final_msg + self.receive_msg(conn)

        image_dict = json.loads(final_msg)
        image_data = image_dict["data"] + '=' * (4 - len(image_dict["data"]) % 4) if len(image_dict["data"]) % 4 != 0 else image_dict["data"]
        image_data = base64.b64decode(image_data)
        image_path = "../upload/" + str(addr[0]) + "_" + str(addr[1]) + "/Frames/"
        os.makedirs(image_path, exist_ok=True)
        with open(image_path + image_dict["image_name"] + "." + image_dict["image_type"], 'wb') as f:
            f.write(image_data)

    def start(self):
        self.server.listen(10)
        print(f"{bcolors.OKGREEN}[LISTENING]{bcolors.ENDC} Server is listening on {SERVER}:{PORT}")
        while True:
            try:
                conn, addr = self.server.accept()
                print(conn)
                thread = threading.Thread(target=self.communication_pipeline, args=(conn, addr), daemon=True)
                thread.start()
                print(f"{bcolors.BOLD}[ACTIVE CONNECTIONS]{bcolors.ENDC}{threading.active_count() - 1}")
            except:  # NON METTERE LE TONDE, da problemi con i certificati ssl altrimenti
                pass  # ignore error


def main():
    server = WebServer()
    server.start()


if __name__ == "__main__":
    main()
