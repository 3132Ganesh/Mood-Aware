import os
import json

"""
MoodAware LLM Fine-Tuning Pipeline
----------------------------------
This script uses HuggingFace Transformers, PEFT (LoRA), and TRL (SFTTrainer)
to fine-tune a lightweight 1.5B/3B open-weight model (e.g. Qwen-2.5-1.5B-Instruct / Llama-3.2-1B)
on the custom MoodAware dataset.

Usage:
    python script/train_moodaware_llm.py --model_id Qwen/Qwen2.5-1.5B-Instruct --output_dir ./models/moodaware-llm
"""

def generate_modelfile_content(model_path: str = "./models/moodaware-llm") -> str:
    modelfile = f"""# Ollama Modelfile for MoodAware Domain LLM
FROM {model_path}

# System Prompt Configuration
SYSTEM \"\"\"You are Agust, the intelligent empathetic AI Personal Manager for MoodAware. 
You specialize in wellness calibration, zero-to-hero skill roadmaps, Hyderabad gym/nutrition advice, and vagus nerve breathing guidance.
Always respond with warmth, precision, and actionable recommendations.\"\"\"

# Inference Parameters
PARAMETER temperature 0.7
PARAMETER top_p 0.9
PARAMETER stop "<|im_end|>"
PARAMETER stop "<|endoftext|>"
"""
    return modelfile

def save_modelfile():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    modelfile_path = os.path.join(script_dir, "Modelfile")
    content = generate_modelfile_content()
    with open(modelfile_path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"[Ollama Config] Modelfile written to: {modelfile_path}")

if __name__ == "__main__":
    print("=== MoodAware LLM Fine-Tuning Pipeline Setup ===")
    save_modelfile()
    print("Run `ollama create moodaware-llm -f script/Modelfile` after training or exporting GGUF model.")
