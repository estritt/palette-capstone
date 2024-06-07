// Builds out a comments section from the original post
import { useEffect, useState } from 'react';
// import { propTypes } from 'react-bootstrap/esm/Image';
import { Form, Container, Image, Row, Col, Button, Card } from "react-bootstrap";
import { useForm, Controller } from 'react-hook-form';
import { useAuth } from './AuthContext';
//reply should be its own module

function Comment({ comment }) {

    const [ avatar, setAvatar ] = useState(null); // there must be some way to avoid having to fetch so often
    const [ replying, setReplying ] = useState(false); // for form toggle
    function toggleReplying() {setReplying(!replying)}
    const { activeUser } = useAuth();
    const {setError, handleSubmit, control, reset, formState: {errors}, getValues 
    } = useForm();

    function submitReply(data, parent) {
        if (!data.reply) return;
        fetch('/entities', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                'user_id': activeUser.url.self.split("=")[1],
                'body': data.reply,
                'parent_id': parent.url.self.split("=")[1],
                'published': true
            })
        })
        .then(response => response.json())
        .then(newComment => {
            parent.children.push(newComment);
            toggleReplying();
        })
    }
    
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

    // i've made a mess of the grid system
    return (<Row className='square rounded-2 mb-3' style={{'backgroundColor': '#F5F5F5'}}>
        {/* <Col className='md-auto'></Col> */}
        {!comment.parent_id ? <> <h4 className='pt-4'>{comment.title}</h4>
            <Col className='p-4 d-flex align-items-start'>
                
                <a href={'/profile/' + comment.user_p.url.self.split("=")[1]} className='d-inline-flex'>
                    <img src={avatar} height='50rem' style={{'backgroundColor': 'white'}} /> 
                    <p className='ps-3 pt-1'>{comment.user_p.username}</p>
                </a>
                {/* <Button size='sm' className='ms-3 align-self-top'>Follow</Button> implement later */}
            </Col>
                <Row><Col classname='p-4'>{comment.body}</Col></Row>
                {activeUser && 
                    <Row> 
                        {/* replying stuff might be better in its own module so these states aren't all here for someone not logged in */}
                        <Col md='auto'><Button className='mt-2' size='sm' onClick={toggleReplying}>{!replying ? 'Reply' : 'Cancel'}</Button></Col>
                        {replying && <>
                            {/* <Col md='auto'><Button size='sm'>Submit</Button></Col> */}
                            <Form onSubmit={handleSubmit(data => submitReply(data, comment))} onReset={reset} className='my-2'>
                                <Form.Group>
                                    <Controller
                                    control={control}
                                    name='reply'
                                    rules={{ required: true }} // this makes body required too somehow?
                                    render={({field: { onChange, onBlur, value, ref }}) => (
                                        <Form.Control 
                                            onChange={onChange} value={value} ref={ref}
                                            // isInvalid={errors.username}
                                            placeholder='type your reply here...' 
                                        />
                                    )}
                                    />
                                </Form.Group>
                                <Form.Group className='d-flex justify-content-end'>
                                    <Button className='mt-2' size='sm' type='submit'>Submit</Button>
                                </Form.Group>
                            </Form>
                        </>}
                    </Row>
                }
                <Row> <Col className='pt-3'>
                    <hr className='mx-auto' style={{'color': 'black','width':'90%','text-align':'left'}} />
                </Col> </Row>
        </> : <><Col className='p-4 d-flex align-items-start'>
                <a href={'/profile/' + comment.user_c.url.self.split("=")[1]} className='d-inline-flex'>
                    <img src={avatar} height='50rem' style={{'backgroundColor': 'white'}} />
                    <p className='ps-3 pt-1'>{comment.user_c.username}</p>
                </a>
                
            </Col>
                <Row>
                    <p className='align-self-end'>{comment.body}</p>
                </Row>
                {activeUser && 
                    <Row> 
                        {/* replying stuff might be better in its own module so these states aren't all here for someone not logged in */}
                        <Col md='auto'><Button size='sm' onClick={toggleReplying}>{!replying ? 'Reply' : 'Cancel'}</Button></Col>
                        {replying && <>
                            {/* <Col md='auto'><Button size='sm'>Submit</Button></Col> */}
                            <Form onSubmit={handleSubmit(data => submitReply(data, comment))} onReset={reset} className='my-2'>
                                <Form.Group>
                                    <Controller
                                    control={control}
                                    name='reply'
                                    rules={{ required: true }} // this makes body required too somehow?
                                    render={({field: { onChange, onBlur, value, ref }}) => (
                                        <Form.Control 
                                            onChange={onChange} value={value} ref={ref}
                                            // isInvalid={errors.username}
                                            placeholder='type your reply here...' 
                                        />
                                    )}
                                    />
                                </Form.Group>
                                <Form.Group className='d-flex justify-content-end'>
                                    <Button className='mt-2' size='sm' type='submit'>Submit</Button>
                                </Form.Group>
                            </Form>
                        </>}
                    </Row>
                }
            </>}
        <Row className='ps-5'>{comment.children ? comment.children.map(child => <Comment key={child.url.self} comment={child} />) : <></>}</Row>
    
    </Row>);
}

export default Comment;