# Secret Santa
This project is used to make secret santa more anonymous.

# Install Instructions

Run `npm install` in the root of the project.

# Starting and using Secret Santa
To Start, type `node app.js` in the root of this project.

Open a browser and go to the URL of the server.

In the default settings this is `127.0.0.1:8080/TheList`.

# Changing the defaults
To change any of the defaults, edit the setup.env file.

Here you'll need to change the main URL to the one your node server resides on.
Do this by finding what out what the IP address the server is on, then edit the line under `# Main URL`.
Doing this will change the address that you'll be given when serving out people's URLs.

You'll probably want to change the list of participants too. Again do this by editting and 
adding names bellow the line `# Participants`.