1 - Snake game will use typescript for frontend and game itself.
2 - Snake game will use dotnet as a backend.
3 - Each feature must be split into small modules that are testable - both frontend and backend.
4 - Each feature should be tested. 
5 - The snake game needs to be dockerized so it is deployable in different platforms.

# Additional information
- The backend will be responsible for storing users and scores. Supported users a guests and registered users. Guests can enter their own name. The browser should also store a cookie of existing user.
- The scoreboard should be accessible from calling the dotnet api.
- The dotnet application should be able to verify users login with their credentials.
- The snake game is not accessible to play until guest name or login is provided