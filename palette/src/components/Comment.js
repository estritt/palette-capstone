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
        } else {
            setAvatar('/default_pfp.png')
        }
    }, []);

    // console.log('recieved comment: ' + JSON.stringify(comment))
    // i've made a mess of the grid system
    return (<Row className='bg-secondary square rounded-2'>
        {/* <Col className='md-auto'></Col> */}
        {!comment.parent_id ? <>
            <Col className='p-4 d-flex align-items-start'>
                <a href={'/profile/' + comment.user_p.url.self.split("=")[1]} className='d-inline-flex'>
                    <img src={avatar} height='50rem' style={{'backgroundColor': 'white'}} /> 
                    <p className='ps-3 pt-1'>{comment.user_p.username}</p>
                </a>
                <Button size='sm' className='ms-3 align-self-top'>Follow</Button>
            </Col>
                <Row><Col classname='p-4'>{comment.body}</Col></Row>
                <Row> <Col className='pt-3'>
                    <hr className='mx-auto' style={{'color': 'black','width':'90%','text-align':'left'}} />
                </Col> </Row>
        </> : <><Col className='p-4 d-flex align-items-start'>
                <a href={'/profile/' + comment.user_c.url.self.split("=")[1]} className='d-inline-flex'>
                    <img src={avatar} height='50rem' style={{'backgroundColor': 'white'}} />
                    <p className='ps-3 pt-1'>{comment.user_c.username}</p>
                </a>
                
            </Col><Row><p className='align-self-end'>{comment.body}</p></Row></>}
        <Row className='ps-5'>{comment.children ? comment.children.map(child => <Comment key={child.url.self} comment={child} />) : <></>}</Row>
    
    </Row>);
}

export default Comment;