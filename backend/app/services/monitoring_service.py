import psutil
import subprocess
import shutil

# Tentative d'import de NVML (Nvidia)
try:
    from pynvml import (
        nvmlInit, nvmlShutdown, nvmlDeviceGetHandleByIndex,
        nvmlDeviceGetUtilizationRates, nvmlDeviceGetMemoryInfo
    )
    NVML_AVAILABLE = True
except Exception:
    NVML_AVAILABLE = False

def get_monitoring_info():
    # 1. Stats CPU & RAM
    cpu_percent = psutil.cpu_percent(interval=None)
    ram = psutil.virtual_memory()

    # Valeurs par défaut
    gpu_data = {
        "available": False,
        "usage_percent": 0,
        "vram_used": 0,
        "vram_total": 0,
        "name": "Non détecté"
    }

    # 2. Tentative NVIDIA (via NVML)
    if NVML_AVAILABLE:
        try:
            nvmlInit()
            handle = nvmlDeviceGetHandleByIndex(0)
            utilization = nvmlDeviceGetUtilizationRates(handle)
            mem_info = nvmlDeviceGetMemoryInfo(handle)
            gpu_data = {
                "available": True,
                "usage_percent": utilization.gpu,
                "vram_used": mem_info.used // (1024**2),
                "vram_total": mem_info.total // (1024**2),
                "name": "NVIDIA GPU"
            }
            nvmlShutdown()
        except Exception:
            pass

    # 3. Fallback AMD (via commande système si NVIDIA échoue)
    if not gpu_data["available"]:
        # On vérifie si l'outil AMD est présent (Linux/ROCm)
        if shutil.which("rocm-smi"):
            gpu_data["name"] = "AMD GPU (ROCm)"
            # Note: Ici on pourrait ajouter la lecture rocm-smi si besoin
        else:
            gpu_data["name"] = "Générique / Intégré"

    return {
        "cpu": { "usage_percent": cpu_percent },
        "ram": { "usage_percent": ram.percent },
        "gpu": gpu_data,
        "vramUsed": gpu_data["vram_used"],
        "vramTotal": gpu_data["vram_total"]
    }