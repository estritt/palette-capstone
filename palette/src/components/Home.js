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

    console.log(posts);

    return (
        <Container fluid className='p-6'>
            <Row className='border border-3 border-secondary square rounded-2 p-5 mb-5'>
                {posts.map(post => {
                    return (
                        <Col key={post.url.self}>
                            <ArtThumbnail path={post.artwork_path} title={post.title} />
                        </Col>
                    )
                })}
            </Row>
        </Container>
    )
}

export default Home;