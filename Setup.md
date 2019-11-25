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

	##Fix auth method
	ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'password'
```

## Start service
``` bash
	sudo systemctl start webServer.service
	sudo systemctl enable webServer.service
```
