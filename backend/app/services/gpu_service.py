import pynvml as nvml
from typing import Dict, Any

class GPUService:
    def __init__(self):
        self.available = False
        try:
            # On essaie d'initialiser NVML
            nvml.nvmlInit()
            self.device_count = nvml.nvmlDeviceGetCount()
            self.available = True
        except Exception as e:
            # On capture l'erreur ici pour empêcher le crash
            print(f"[DEBUG] Service GPU non disponible (Pas de carte ou driver manquant) : {e}")
            self.available = False

    def get_gpu_stats(self) -> Dict[str, Any]:
        if not self.available:
            return {
                "available": False,
                "name": "Aucune détectée",
                "usage": 0,
                "used_mb": 0,
                "total_mb": 0
            }

        try:
            handle = nvml.nvmlDeviceGetHandleByIndex(0) # On prend la carte 0
            
            # Nom de la carte
            name_raw = nvml.nvmlDeviceGetName(handle)
            name = name_raw.decode("utf-8") if isinstance(name_raw, bytes) else name_raw
            
            # Utilisation (%)
            utilization = nvml.nvmlDeviceGetUtilizationRates(handle)
            gpu_usage = utilization.gpu
            
            # Mémoire VRAM
            mem_info = nvml.nvmlDeviceGetMemoryInfo(handle)
            used_mb = mem_info.used // 1024**2
            total_mb = mem_info.total // 1024**2

            return {
                "available": True,
                "name": name,
                "usage": gpu_usage,
                "used_mb": used_mb,
                "total_mb": total_mb
            }

        except Exception as e:
            print(f"[DEBUG] Erreur lecture GPU : {e}")
            return { "available": False, "name": "Erreur lecture" }

# Singleton
gpu_service = GPUService()