import os
import json
import subprocess
from google import genai
from google.genai import types

class MultiAgentSystem:
    def __init__(self):
        # Securely loading the Gemini API key, defaulting to a placeholder
        os.environ["GEMINI_API_KEY"] = os.getenv("GEMINI_API_KEY", "YOUR_GEMINI_API_KEY")
        self.client = genai.Client()
        self.project_dir = "generated_project" # Main folder to store the generated project

    def _ask_gemini(self, system_instruction, user_content, json_mode=False):
        """Central function used by all agents to interact with Gemini."""
        config = types.GenerateContentConfig(system_instruction=system_instruction)
        if json_mode:
            config.response_mime_type = "application/json"
            
        response = self.client.models.generate_content(
            model='gemini-2.5-flash',
            contents=user_content,
            config=config
        )
        return response.text

    def _get_project_structure(self):
        """Reads all files and their contents from the current project directory."""
        if not os.path.exists(self.project_dir):
            return "The project is currently empty (no files found)."
            
        structure = {}
        for root, _, files in os.walk(self.project_dir):
            for file in files:
                rel_path = os.path.relpath(os.path.join(root, file), self.project_dir)
                try:
                    with open(os.path.join(root, file), "r", encoding="utf-8") as f:
                        structure[rel_path] = f.read()
                except Exception:
                    structure[rel_path] = "[Binary or unreadable file]"
        return json.dumps(structure, indent=2, ensure_ascii=False)

    # 1. AGENT: CEO (CHIEF ARCHITECT)
    def agent_ceo(self, user_request, current_structure):
        print("🧠 [CEO Agent]: Planning main architecture, database, and DevOps structure...")
        instruction = """You are the Chief Architect / CEO of a multi-agent system. 
        Analyze the user's request and plan the complete file structure (frontend, backend, database, devops) for the project.
        You must return the response strictly in the following JSON format:
        {
          "plan_summary": "Brief explanation of the overall project plan",
          "files_to_create": ["backend/main.py", "database/schema.sql", "Dockerfile", "docker-compose.yml"]
        }"""
        content = f"USER REQUEST: {user_request}\n\nCURRENT PROJECT STRUCTURE:\n{current_structure}"
        return self._ask_gemini(instruction, content, json_mode=True)

    # 2. AGENT: CODER (SOFTWARE ENGINEER)
    def agent_coder(self, ceo_plan, current_structure):
        print("💻 [Coder Agent]: Writing application source code (backend/frontend)...")
        instruction = """You are a Full-Stack Software Engineer agent. Generate the required application files based on the CEO's plan.
        You must return the response strictly in the following JSON format:
        {
          "files": [
            {
              "filepath": "backend/main.py",
              "content": "...complete source code of the file..."
            }
          ]
        }"""
        content = f"CEO PLAN:\n{ceo_plan}\n\nCURRENT PROJECT STRUCTURE AND CODE:\n{current_structure}"
        return self._ask_gemini(instruction, content, json_mode=True)

    # 3. AGENT: DATABASE (DB EXPERT)
    def agent_database(self, ceo_plan, current_structure):
        print("🗄️ [Database Agent]: Designing database schemas (SQL/PostgreSQL/MongoDB)...")
        instruction = """You are a Database Specialist agent. Based on the CEO's plan, write the necessary 
        SQL, PostgreSQL, or MongoDB schemas and models for the project.
        You must return the response strictly in the following JSON format:
        {
          "files": [
            {
              "filepath": "database/schema.sql",
              "content": "...complete database schema code..."
            }
          ]
        }"""
        content = f"CEO PLAN:\n{ceo_plan}\n\nCURRENT PROJECT STRUCTURE:\n{current_structure}"
        return self._ask_gemini(instruction, content, json_mode=True)

    # 4. AGENT: DEVOPS (INFRASTRUCTURE ENGINEER)
    def agent_devops(self, ceo_plan, current_structure):
        print("🚢 [DevOps Agent]: Preparing Docker, Docker-Compose, and cloud configurations...")
        instruction = """You are a DevOps Engineer agent. Create the Dockerfile, docker-compose.yml, 
        or other infrastructure configuration files according to the CEO's plan.
        You must return the response strictly in the following JSON format:
        {
          "files": [
            {
              "filepath": "Dockerfile",
              "content": "...dockerfile content..."
            },
            {
              "filepath": "docker-compose.yml",
              "content": "...docker-compose content..."
            }
          ]
        }"""
        content = f"CEO PLAN:\n{ceo_plan}\n\nCURRENT PROJECT STRUCTURE:\n{current_structure}"
        return self._ask_gemini(instruction, content, json_mode=True)

    # 5. AGENT: QA TESTER (QUALITY ASSURANCE)
    def agent_tester(self, all_files_json):
        print("🧪 [QA Tester Agent]: Reviewing all files for system-wide integrity...")
        instruction = """You are a QA Tester agent. Review all provided files (code, database schemas, devops configurations).
        You must return the response strictly in this JSON format: {"status": "APPROVED" or "ERROR", "feedback": "reason for error or congratulatory message"}."""
        return self._ask_gemini(instruction, all_files_json, json_mode=True)

    # 6. AGENT: DEPLOYER (RELEASE ENGINEER)
    def agent_deployer(self, all_files_json):
        print("🚀 [Deployer Agent]: Creating all modules on disk and pushing to GitHub...")
        data = json.loads(all_files_json)
        
        for file_info in data.get("files", []):
            rel_path = file_info["filepath"]
            full_path = os.path.join(self.project_dir, rel_path)
            
            os.makedirs(os.path.dirname(full_path), exist_ok=True)
            
            with open(full_path, "w", encoding="utf-8") as f:
                f.write(file_info["content"])
            print(f" └─ 📄 File created: {rel_path}")

        try:
            subprocess.run(["git", "config", "--global", "user.name", "Multi-Agent-Evolve-Engine"], check=True)
            subprocess.run(["git", "config", "--global", "user.email", "multi-agent@ai.com"], check=True)
            subprocess.run(["git", "add", "."], check=True)
            subprocess.run(["git", "commit", "-m", "🤖 Multi-Agent: Complete system upgrade including Database and DevOps!"], check=True)
            subprocess.run(["git", "push"], check=True)
            print("✅ [Deployer Agent]: Success! Whole system pushed to GitHub!")
        except Exception as e:
            print(f"⚠️ [Deployer Agent Note]: Git push error: {e}")

    # 🔄 CENTRAL COORDINATOR
    def start_evolution(self, upgrade_command):
        current_structure = self._get_project_structure()

        # Step 1: CEO Planning
        ceo_plan = self.agent_ceo(upgrade_command, current_structure)
        
        # Step 2: Coder, Database, and DevOps agents work in parallel
        coder_res = json.loads(self.agent_coder(ceo_plan, current_structure))
        db_res = json.loads(self.agent_database(ceo_plan, current_structure))
        devops_res = json.loads(self.agent_devops(ceo_plan, current_structure))
        
        # Combine all files into a single list
        combined_files = []
        combined_files.extend(coder_res.get("files", []))
        combined_files.extend(db_res.get("files", []))
        combined_files.extend(devops_res.get("files", []))
        
        all_files_payload = json.dumps({"files": combined_files}, ensure_ascii=False)

        # Step 3: Tester reviews the entire system
        test_result = json.loads(self.agent_tester(all_files_payload))
        
        if test_result.get("status") == "APPROVED":
            # Step 4: Deployer writes files to directories and deploys
            self.agent_deployer(all_files_payload)
        else:
            print(f"❌ Tester found an error, evolution halted: {test_result.get('feedback')}")


# ========================================================
# 🚀 RUN THE MEGA-SYSTEM FROM HERE
# ========================================================
if __name__ == "__main__":
    system_engine = MultiAgentSystem()
    
    # Example request for an Alibaba-like mega-project
    command = "Build the foundation of an e-commerce platform like Alibaba: write a FastAPI server in 'backend/main.py', PostgreSQL tables for products and users in 'database/schema.sql', as well as 'Dockerfile' and 'docker-compose.yml' configurations."
    
    system_engine.start_evolution(command)
