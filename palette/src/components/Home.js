import { useEffect, useState } from "react";
import { Container, Image, Row, Col, Button, Card } from "react-bootstrap";

import ArtThumbnail from "./ArtThumbnail";

function Home() {

    const [ posts, setPosts ] = useState([]);

    useEffect(() => {
        fetch('/posts')
        .then(response => response.json())
        .then(data => setPosts(data))
    }, []);

    // console.log(posts);

    return (
        <Container fluid className='p-6'> 
        {/* i use this container for thumbnails a lot - it should be its own module */}
            <Row className='border border-3 border-secondary square rounded-2 p-5 pb-0 mb-5' style={{'backgroundColor': 'var(--background)'}}>
                {posts.map(post => {
                    return (
                        <Col className='d-flex justify-content-center align-items-center pb-5' xs={12} sm={6} md={4} lg={3} key={post.url.self}>
                            <ArtThumbnail path={post.artwork_path} title={post.title} />
                        </Col>
                    )
                })}
            </Row>
        </Container>
    )
}

export default Home;