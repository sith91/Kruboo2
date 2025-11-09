import yaml
import os
from pathlib import Path

def load_config():
    """Load configuration from YAML file"""
    config_path = Path(__file__).parent / "default.yaml"
    
    with open(config_path, 'r') as file:
        config = yaml.safe_load(file)
    
    # Override with environment variables
    if os.getenv('AI_ASSISTANT_ENV') == 'production':
        config['app']['environment'] = 'production'
        config['app']['debug'] = False
    
    return config
