import { useEffect, useState } from "react";
import { Container, Image, Row, Col, Button, Card } from "react-bootstrap";

import ArtThumbnail from "./ArtThumbnail";
import { useAuth } from "./AuthContext";

// maybe eventually include comments that have artwork
function Following() {
    const [ posts, setPosts ] = useState([]);

    useEffect(() => {
        fetch('/posts-from-following')
        .then(response => response.json())
        .then(data => setPosts(data.posts)) //indexing because the response is an object with two other keys for the page# and size
    }, []);
    // console.log('posts: ' + JSON.stringify(posts))

    return (
        <Container fluid className='p-6'>
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

export default Following;