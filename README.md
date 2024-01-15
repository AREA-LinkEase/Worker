## Linkease Worker

### Description
**Linkease** is a cutting-edge platform inspired by **IFTTT (If This Then That)**, a web-based service that enables users to create chains of simple conditional statements, known as applets. These applets trigger actions in various web services and devices. For more information on IFTTT, visit their website.

Linkease specializes in integrating and automating a variety of services, primarily focusing on **OAuth 2.0** and **webhook-compatible services**. It allows users to effortlessly create and manage these services by filling out a form on the platform.

### Features
- **Service Creation:** Users can add OAuth 2.0 and webhook services to Linkease.
- **Triggers and Actions:** These services can house triggers and actions, functioning like callable functions. This process is streamlined by a unique, no-code program provided by Linkease, reminiscent of Blueprint or Scratch.
- **Workspaces:** Linkease offers workspaces for grouping automations, enabling users to craft no-code programs that utilize triggers and actions.
- **Team Collaboration:** Managers of workspaces and services can invite others for collaborative efforts.

### The Role of Linkease Worker
The primary function of the Linkease worker is to fetch an automation via an HTTP request and then execute it. Multiple workers can connect to Linkease for efficient operation.

### Installation
#### Via Dockerfile
1. Ensure **Docker** is installed on your machine.
2. Clone this repository.
3. Navigate to the project directory.
4. Execute the following command to build the Docker image:
   ```
   docker build -t linkease-worker .
   ```
5. Once the build is complete, start the container using:
   ```
   docker run linkease-worker
   ```

#### Via npm start
1. Clone this repository.
2. Navigate to the project directory.
3. Execute the following command to install dependencies:
   ```
   npm install
   ```
4. Start the application with:
   ```
   npm start
   ```

### Contribution
For contributing, please refer to the information available on this page.

### Contributors
- **Younes Bahri** - DevOps, Full-stack Developer

### License
This project is licensed under the **MIT License**. Refer to the LICENSE file for more details.

### Contact
For any inquiries or contributions, please contact the team members in the following order of priority:
- **Younes Bahri** - younes1.bahri@epitech.eu
