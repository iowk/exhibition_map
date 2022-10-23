# EXmap
http://exmap.org </br>
## About
EXmap is a collaboration-based map that displays museum and exhibition information. Authenticated users are allowed to suggest contents to the map, which will be shown publicly upon verification by the staffs.

## Architecture
### Backend
<ul>
    <li>Django restful framework (DRF) + JWT authentication, deployed on AWS EC2 + AWS lambda</li>
    <li>MySQL database deployed on AWS RDS</li>
    <li>Media files stored at AWS S3</li>
</ul>

### Frontend
<ul>
    <li>React-Bootstrap, deployed on AWS S3.</li>
</ul>

## Functions
### Guest user
<ul>
    <li>Display map information: museums, exhibitions, comments, photos</li>
    <li>Search utility</li>
    <li>User registration + email verification</li>
</ul>

### Authenticated user
<ul>
    <li>JWT authentication</li>
    <li>Suggest museums or exhibitions</li>
    <li>Report incorrect information</li>
    <li>Write or modify comments and give ratings</li>
    <li>Manage comments on user page<li>
    <li>Upload photos</li>
</ul>

### Staff
<ul>
    <li>Create, update, delete contents</li>
    <li>Verify suggested museums or exhibitions</li>
    <li>Manage user reports</li>
</ul>

## TODO
<ul>
    <li>User change password, recover password</li>
    <li>OAuth2 authentication for logging in with Google, Facebook, etc.</li>
    <li>Multilanguage support</li>
    <li>Caching</li>
    <li>Improved search utility with more information considered</li>
</ul>