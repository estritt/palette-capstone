// Builds out a comments section from the original post
import { useEffect, useState } from 'react';
// import { propTypes } from 'react-bootstrap/esm/Image';
import { Container, Image, Row, Col, Button, Card } from "react-bootstrap";

function Comment({ comment }) {

    const [ avatar, setAvatar ] = useState(null); // there must be some way to avoid having to fetch so often
    
    useEffect(() => {
        const filename = comment.parent_id ? comment.user_c.avatar_filename : comment.user_p.avatar_filename
        if (filename) {
            fetch(`/images/avatars/${filename}`)
            .then(response => response.blob())
            .then(blob => setAvatar(URL.createObjectURL(blob)))
        }
    }, []);

    // console.log('recieved comment: ' + JSON.stringify(comment))
    return (<Row className='bg-secondary'>
        {/* <Col className='md-auto'></Col> */}
        <Col>{!comment.parent_id ? <>
            <a href={'/profile/' + comment.user_p.url.self.slice(-1)} className='d-inline-flex'>
                <img src={avatar} height='50rem'/>
                <p className='ps-3'>{comment.user_p.username}</p>
            </a>
        </> : <>
            <a href={'/profile/' + comment.user_c.url.self.slice(-1)} className='d-inline-flex'>
                <img src={avatar} height='50rem'/>
                <p className='ps-3'>{comment.user_c.username}</p>
            </a>
            <p>{comment.body}</p>
        </>}</Col>
        <Row>{comment.children ? comment.children.map(child => <Comment key={child.url.self} comment={child} />) : <></>}</Row>
    
    </Row>);
}

export default Comment;