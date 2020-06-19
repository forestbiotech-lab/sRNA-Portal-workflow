# Steps to setup new instance

## Project specific vars
```bash
	USERNAME="brunocosta"
	gitProject="https://github.com/forestbiotech-lab/sRNA-Portal-workflow.git"
	repo="sRNA-Portal-workflow"
	db="sRNAPlantPortal"
```

## Setup instance
``` bash
	sudo adduser ${USERNAME}
	sudo usermod -aG sudo,adm ${USERNAME}
	sudo su ${USERNAME}
	cd
	mkdir .ssh
	sudo cp /home/ubuntu/.ssh/authorized_keys ~/.ssh/authorized_keys
	sudo chown ${USERNAME}:${USERNAME} ~/.ssh/authorized_keys
	sudo chmod 644 ~/.ssh/authorized_keys
	sudo apt update
	sudo apt upgrade
```

## git
``` bash
	mkdir .git
	cd .git
	git clone ${gitProject}
```

## zsh shell
``` bash
cd
git clone https://github.com/StuntsPT/oh-my-zsh .oh-my-zsh
ln -s .oh-my-zsh/.zshrc .zshrc
cd .oh-my-zsh
git submodule update --init --recursive
sudo apt install zsh
sudo chsh ${USERNAME} -s /usr/bin/zsh 
```
## Systemd Web server service
``` bash
	cd 
	cd .git/${repo}/bin
	systemctl link /home/${USERNAME}/.git/${repo}/bin/webServer.service
```

## NodeJS
``` bash
	sudo snap install --edge --classic node
	npm i
	mkdir "${HOME}/.npm-packages"
	vim ~/.zshrc
	###.zshrc
	NPM_PACKAGES="${HOME}/.npm-packages"
	export PATH="$PATH:$NPM_PACKAGES/bin"
	# Preserve MANPATH if you already defined it somewhere in your config.
	# Otherwise, fall back to `manpath` so we can inherit from `/etc/manpath`.
	export MANPATH="${MANPATH-$(manpath)}:$NPM_PACKAGES/share/man"
	export PATH=$PATH:/snap/bin
	#######
	npm i nodemon -global
```

## Mysql
``` bash
	sudo apt install mysql-server
	sudo mysql_secure_installation
	sudo mysql -u root -p
	SET GLOBAL validate_password_policy=low
	CREATE DATABASE ${db};
	create USER 'webapp'@'localhost' IDENTIFIED WITH mysql_native_password BY 'randompassword'; GRANT ALL PRIVILEGES ON `sRNAPlantPortal`.* TO 'webapp'@'localhost'; FLUSH PRIVILEGES;
	sudo mysql -u root -D ${db} -p <SQL/LATEST_dump.sql

  REVOKE ALL privileges ON `sRNAPlantPortal`.`User` FROM `webapp`; 
	REVOKE ALL privileges ON `sRNAPlantPortal`.`Access` FROM `webapp`; 

  ##Fix auth method
	ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'password'
```

## Start service
``` bash
	sudo systemctl start webServer.service
	sudo systemctl enable webServer.service
```

## Install Docker

[Official info](https://docs.docker.com/engine/install/ubuntu/)


``` bash
  #Remove older verions
  sudo apt-get remove docker docker-engine docker.io containerd runc
  sudo apt-get update
  sudo apt-get install \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg-agent \
    software-properties-common

  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
  #Verify that you now have the key with the fingerprint 9DC8 5822 9FC7 DD38 854A  E2D8 8D81 803C 0EBF CD88
  sudo apt-key fingerprint 0EBFCD88 
  sudo add-apt-repository \
   "deb [arch=amd64] https://download.docker.com/linux/ubuntu \
   $(lsb_release -cs) \
   stable"
  sudo apt-get update
  sudo apt-get install docker-ce docker-ce-cli containerd.io

  ##or 

  yay docker

  #Test if it is working 
  sudo docker run hello-world
  
  #To use docker with-out root add your username to docker group
  sudo usermod -aG docker USER
```


