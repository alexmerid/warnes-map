import sys
import os

RUTA_APP = '/media/alexander/Unidad_E/Warnes/warnes-map/'
sys.path.insert(0, RUTA_APP)
os.environ['PYTHONPATH'] = RUTA_APP

from app import app as application