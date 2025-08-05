from enum import Enum;

class ERROR_MESSAGES(str, Enum):
    DEFAULT = (
        lambda err="": f'{"Something went wrong :/" if err == "" else "[ERROR: " + str(err) + "]"}'
    )
    INVALID_TOKEN = "Your session has expired or the token is invalid. Please sign in again."
    USER_NOT_FOUND = "User not found. Please contact administrator."
    INVALID_REFRESH_TOKEN = "Refresh token is invalid or has expired. Please sign in again."
    NOT_FOUND = "Resources not found."
    FILE_EXISTS = "File already exists. Please upload different file."
    
    @staticmethod
    def DEFAULT(err: str = "") -> str:
        if not err:
            return "Something went wrong :/";
        return f"[ERROR: {err}]";
    
    