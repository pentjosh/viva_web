import random;

SEED = 6285222311254;

def gen_key(SEED):
    random.seed(SEED);
    return [random.randint(1, 9) for _ in range(256)];

key = gen_key(SEED);

def encrypt(text: str) -> str:
    encrypted_text = "".join(chr((ord(char) + key[i % len(key)]) % 256) for i, char in enumerate(text));
    return encrypted_text.encode("latin1").hex();

def decrypt(encrypted_hex: str) -> str:
    encrypted_text = bytes.fromhex(encrypted_hex).decode("latin1")
    decrypted_text = "".join(chr((ord(char) - key[i % len(key)]) % 256) for i, char in enumerate(encrypted_text));
    return decrypted_text;

# class Enc:
#     def __init__(self):
#         self.seed = SEED;
#         self.key = self.gen_key();

#     def gen_key(self):
#         random.seed(SEED);
#         return [random.randint(1, 9) for _ in range(256)];

#     def encrypt(self, text: str) -> str:
#         encrypted_text = "".join(chr((ord(char) + self.key[i % len(self.key)]) % 256) for i, char in enumerate(text));
#         return encrypted_text.encode("latin1").hex();

#     def decrypt(self, encrypted_hex: str) -> str:
#         encrypted_text = bytes.fromhex(encrypted_hex).decode("latin1")
#         decrypted_text = "".join(chr((ord(char) - self.key[i % len(self.key)]) % 256) for i, char in enumerate(encrypted_text));
#         return decrypted_text;
    
#     def verify_password(self,password, hashed_password):
#         return enc.encrypt(password) == hashed_password;

# enc = Enc();