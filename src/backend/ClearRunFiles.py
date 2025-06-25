import os
import shutil

def clear_runfiles():
    """
    Delete all files and subdirectories within the 'runfiles' directory.
    """
    base_dir = os.path.dirname(os.path.abspath(__file__))
    target_dir = os.path.join(base_dir, "runfiles")

    if not os.path.isdir(target_dir):
        print(f"No 'runfiles' directory found at {target_dir}")
        return

    for entry in os.listdir(target_dir):
        path = os.path.join(target_dir, entry)
        try:
            if os.path.isfile(path) or os.path.islink(path):
                os.remove(path)
            elif os.path.isdir(path):
                shutil.rmtree(path)
        except Exception as e:
            print(f"Failed to delete {path}: {e}")

    print(f"Cleared all contents of {target_dir}")

if __name__ == "__main__":
    clear_runfiles()