# Installing Docker and Docker Compose on macOS

This guide will help you install Docker and Docker Compose on macOS.

## Install Docker Desktop (Includes Docker and Docker Compose)

Docker Desktop for Mac is an easy way to install both Docker and Docker Compose.

### Steps:

1. Visit the Docker Desktop for Mac download page:
   https://www.docker.com/products/docker-desktop

2. Click on "Download for Mac" and select the appropriate version for your Mac:
   - For M1/M2 Macs (Apple Silicon): Download the ARM64 version
   - For Intel Macs: Download the Intel version

3. Once downloaded, double-click the `.dmg` file to open it.

4. Drag the Docker.app to your Applications folder.

5. Open Docker Desktop from your Applications folder.

6. Follow the installation prompts and grant the necessary permissions.

7. Wait for Docker to start (you'll see the Docker icon in the menu bar).

8. Verify the installation by opening Terminal and running:
   ```bash
   docker --version
   docker-compose --version
   ```

## Alternative: Install with Homebrew

If you prefer using Homebrew, follow these steps:

1. Install Docker:
   ```bash
   brew install --cask docker
   ```

2. Start Docker Desktop:
   ```bash
   open /Applications/Docker.app
   ```

3. Docker Compose is included with Docker Desktop, but you can also install it separately:
   ```bash
   brew install docker-compose
   ```

4. Verify the installation:
   ```bash
   docker --version
   docker-compose --version
   ```

## Using Docker and Docker Compose

Once Docker and Docker Compose are installed, you can deploy the NNA Registry Service using the instructions in the [Docker Deployment Guide](DOCKER_DEPLOYMENT.md).

## Troubleshooting

### Docker Desktop won't start

1. Check for system requirements:
   - macOS 10.15 or newer for recent versions
   - 4GB RAM minimum

2. Check for conflicts with VirtualBox:
   - Docker Desktop uses Hyperkit, which may conflict with VirtualBox

3. Reset Docker Desktop:
   - Click the Docker icon in the menu bar
   - Select Preferences/Settings
   - Click the Reset button

### Permission issues

1. Ensure you have administrative access on your Mac.

2. Try running Docker commands with `sudo`:
   ```bash
   sudo docker-compose up -d
   ```

### Resource limits

Docker Desktop has default resource limits that may need to be adjusted:

1. Click the Docker icon in the menu bar
2. Select Preferences/Settings
3. Go to Resources
4. Adjust CPU, Memory, Swap, and Disk as needed

## Next Steps

After installing Docker and Docker Compose, you can:

1. Verify the installation:
   ```bash
   docker run hello-world
   ```

2. Deploy the NNA Registry Service:
   ```bash
   cd nna-registry-service
   docker-compose up -d
   ```