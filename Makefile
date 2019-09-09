all: new

new:
	@if [ "$(post)" == "" ]; then \
		echo "[error] empty post name"; \
		echo "[usage] make new post=<post-name>"; \
		exit 1; \
	fi
	hugo new posts/$(post).md

run:
	hugo server -D
