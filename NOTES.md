// Authenticate
gcloud auth configure-docker asia-south1-docker.pkg.dev

// Build image
./build_image.sh

// Create tag
docker tag twitter-socket-server:1.0.0 asia-south1-docker.pkg.dev/personal-projects-388416/server-images-repository/twitter-socket-server:1.0.0

// Push tag
docker push asia-south1-docker.pkg.dev/personal-projects-388416/server-images-repository/twitter-socket-server:1.0.0

// To check existing tags
docker images <image_name> --format="{{ .Tag }}"
