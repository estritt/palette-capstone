import { Container, Image, Row, Col, Button, Card } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";

function Profile() {
    
    const params = useParams();
    const parID = params.id;

    const [ profile, setProfile ] = useState(null);

    useEffect(() => {
        fetch(`/users/${parID}`)
        .then(response => response.json())
        .then(data => setProfile(data))
        .catch(error => console.log(error));
    }, [params]);

    // if (!profile) return <div>Oops!</div>

    return (
        <Container fluid className='p-6'>
            <Row className='border border-secondary square rounded-2 p-5 mb-0'>
            <Col xs={4} className='p-1 ms-5'>
                    <p >hello!</p>
                </Col>
            </Row>
        </Container>
    );

}

export default Profile;