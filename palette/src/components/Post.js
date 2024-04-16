import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Image, Row, Col, Button, Card } from "react-bootstrap";
// import RenderChildren from './RenderChildren';
import Comment from './Comment';

function Post() {
    
    const { filename } = useParams();
    const [ artwork, setArtwork ] = useState();
    const [ post, setPost ] = useState(null);

    useEffect(() => {
        fetch(`/posts/${filename}.jpg`) // get post by filename
        .then(response => response.json()) // add catch!!
        .then(data => {
            setPost(data);
            fetch(`/images/artworks/${filename}.jpg`)
            .then(response => response.blob())
            .then(blob => setArtwork(URL.createObjectURL(blob)));
        })
    }, []);

    // console.log('post: ' + JSON.stringify(post))
    // console.log('artwork: ' + artwork)

    if (!post) return <div>oops!</div>

    return (
        <Container fluid className='p-6'>
            <Row className='border border-3 border-secondary square rounded-2 p-5 mb-5' style={{'backgroundColor': '#ECECEC'}}>
                <Col>
                    <img  
                        src = {artwork}
                        className='img-fluid  mx-auto d-block'
                    />
                </Col>
            </Row>
            <Row className='border border-3 border-secondary square rounded-2 p-5 mb-5' style={{'backgroundColor': '#ECECEC'}}>
                {/* {post.children ? <RenderChildren post={post} /> : <></>} */}
                <Comment comment={post} />
            </Row>
        </Container>
    );

}

export default Post;