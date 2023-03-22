deploy-with-build:
	npm run build -ws
	cd terraform && \
	terraform apply --auto-approve
	