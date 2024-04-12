import { Container, Image, Row, Col, Button, Card } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
// import { useOutletContext } from "react-router-dom";

function Profile() { // add useAuth to check if it's ur own profile for editing
    
    const params = useParams();
    const parID = params.id;

    const [ profile, setProfile ] = useState(null);
    const [ avatarPath, setAvatarPath ] = useState("");

    useEffect(() => {
        fetch(`/users/${parID}`)
        .then(response => response.json())
        .then(data => {
            setProfile(data)
            fetch(`/images/avatars/${data.avatar_filename}`)
            .then(response => response.blob())
            .then(blob => setAvatarPath(URL.createObjectURL(blob)))
            .catch(error => console.log(error));
        })
        .catch(error => console.log(error));
    }, [params]);

    // useEffect(() => { //avatar_path is the field in user data, AvatarPath is the link for src
    //     fetch(`/avatars/${profile.avatar_filename}`)
    //     .then(response => response.blob())
    //     .then(blob => setAvatarPath(URL.createObjectURL(blob)))
    //     .catch(error => console.log(error));
    // }, [profile]);

    if (!profile) return <div>Oops!</div> // redirect error page
    console.log(profile)
    return (
        <Container fluid className='p-6'>
            {/* might make more sense to have two containers instead of a div with row children */}
            <div className='border border-3 border-secondary square rounded-2 p-5 mb-5'>
            <Row >
                {/* would make more sense to have info and avatar be separate cols */}
                <Col xs={6} className='d-flex p-1'>
                    <Image
                        src = {avatarPath}
                        height='100rem'
                    />
                    <div>
                        <p className='px-3 pt-3'>{profile.username}</p>
                        <p className='px-3' /*style={{'font-size':13}}*/>Member since {new Date(profile.created_at).toLocaleDateString()}</p>
                    </div>
                </Col>
            </Row>
            <Row>
                <p className='pt-3'>{profile.bio}</p>
            </Row>
            </div>
            
            <Row className='border border-3 border-secondary square rounded-2 p-5 mb-0'>

            </Row>
        </Container>
    );

}

export default Profile;