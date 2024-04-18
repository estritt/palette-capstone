import { useContext, useEffect, useRef, useState } from 'react';
import { Container, Row, Col, Button, Card, Form } from 'react-bootstrap';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom'; 

import DrawMenu from "./DrawMenu";
import { useAuth } from './AuthContext';

function DrawNew() {
    
    const { activeUser } = useAuth();
    const navigate = useNavigate();

    const {setError, handleSubmit, control, reset, formState: {errors}, getValues                      
    } = useForm();

    const canvasRef = useRef(null);
    const ctxRef = useRef(null);
    const [ isDrawing, setIsDrawing ] = useState(false);
    const [ lineWidth, setLineWidth ] = useState(5);
    const [ primaryColor, setPrimaryColor ] = useState('black');
    const [ lineOpacity, setLineOpacity ] = useState(1.0);

    useEffect(() => { //must separate out the effects that handle line properties and the fetching
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d'); 
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.globalAlpha = lineOpacity;
        ctx.strokeStyle = primaryColor;
        ctx.lineWidth = lineWidth;
        ctxRef.current = ctx;
        
    }, [ primaryColor, lineOpacity, lineWidth ]);

    const startDrawing = (e) => {
        ctxRef.current.beginPath();
        ctxRef.current.moveTo(
            e.nativeEvent.offsetX,
            e.nativeEvent.offsetY
        );
        setIsDrawing(true);
    }

    const endDrawing = () => { 
        ctxRef.current.closePath(); 
        setIsDrawing(false); 
    }; 
    
    const draw = (e) => { 
        if (!isDrawing) { 
            return; 
        } 
        ctxRef.current.lineTo( 
            e.nativeEvent.offsetX, 
            e.nativeEvent.offsetY 
        ); 
    
        ctxRef.current.stroke(); 
    }; 

    function SubmitPublish(data, canvasRef) { //shouldn't have to include canvasRef as arg, like post
        if (!data.title) {console.log('no title!'); return}
        canvasRef.current.toBlob(blob => {
            const file = new File([blob], 'image', {type: 'image/jpg'})
            const formData = new FormData(); // can't use JSON.stringify for files
            formData.append('image', file);
            fetch('/artworks', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(imageData => {
                fetch('/entities', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ 
                        ...data,
                        'user_id': parseInt(activeUser.url.self.split("=")[1]), 
                        'published': true,
                        'artwork_path': imageData.file_path.slice(11) // need to be more consistent with using path vs filename
                    })
                })
                .then(response => response.json())
                .then(navigate(`/post/${imageData.file_path.slice(11,-4)}`))
            }) 
        })
    }

    function SubmitDraft(data, canvasRef) {
        console.log(data)
        if (data.title == "") {delete data.title;}
        if (data.body == "") {delete data.body;}
        canvasRef.current.toBlob(blob => {
            const file = new File([blob], 'image', {type: 'image/jpg'})
            const formData = new FormData(); // can't use JSON.stringify for files
            formData.append('image', file);
            fetch('/artworks', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(imageData => {
                fetch('/entities', { // pointless to use urls if reqs are done like this
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        ...data, 
                        'user_id': parseInt(activeUser.url.self.split("=")[1]), 
                        'published': false,
                        'artwork_path': imageData.file_path.slice(11)
                    })
                })
                .then(() => navigate(`/drafts`))
            })
        })
    }

    function SubmitDownload(data, canvasRef) {
        // document.write('<img src="'+canvasRef.current.toDataURL("image/jpeg")+'"/>');
        const url = canvasRef.current.toDataURL();
        const link = document.createElement('a');
        link.href = url;
        link.download = data.title ? `${data.title}.png` : 'canvas-image.png'
        link.click();
    }

    return ( // using rows causes the brush to be offset from the cursor
        <Container fluid className='p-6'> 
            <div className='border border-3 border-secondary square rounded-2 p-5 mb-5 ' style={{'backgroundColor': '#ECECEC'}}> 
                {!activeUser && <p>Login before painting if you want to submit it or save a draft!</p>}
                <DrawMenu 
                    setPrimaryColor={setPrimaryColor} 
                    setLineWidth={setLineWidth} 
                    setLineOpacity={setLineOpacity} 
                /> 
                <div className='justify-content-center d-flex'>
                    <canvas 
                        style={{'backgroundColor': 'white'}}
                        onMouseDown={startDrawing} 
                        onMouseUp={endDrawing} 
                        onMouseMove={draw} 
                        ref={canvasRef} 
                    /> 
                </div>
                {canvasRef.current && ( <div className='px-1 py-2'>
                    <input name='width' type='number' defaultValue={canvasRef.current.width} onChange={e => canvasRef.current.width = e.target.value}/>
                    <input name='height' type='number' defaultValue={canvasRef.current.height} onChange={e => canvasRef.current.height = e.target.value}/>
                </div>)}
            </div>
                <Form onSubmit={handleSubmit(data => SubmitPublish(data, canvasRef))} onReset={reset} className='border border-3 border-secondary square rounded-2 p-5 mb-5' style={{'backgroundColor': '#ECECEC'}}>
                    <Form.Group className='mb-3' controlId='title'>
                        <Form.Label>Title</Form.Label>
                        <Controller 
                            control={control}
                            name='title'
                            defaultValue={''}
                            render={({field: { onChange, onBlur, value, ref }}) => (
                                <Form.Control 
                                    onChange={onChange} value={value} ref={ref}
                                    // isInvalid={errors.username}
                                    placeholder='title' 
                                />
                            )}
                        />
                    </Form.Group>
                    <Form.Group controlId='body'>
                        <Form.Label>Body</Form.Label>
                            <Controller 
                                control={control}
                                name='body'
                                defaultValue={''}
                                render={({field: { onChange, onBlur, value, ref }}) => (
                                    <Form.Control 
                                        as="textarea"
                                        style={{ height: '200px', 'resize': 'none' }}
                                        onChange={onChange} value={value} ref={ref}
                                        // isInvalid={errors.username}
                                        placeholder='body' 
                                    />
                                )} 
                            />
                    </Form.Group>
                    <Form.Group className='p-3 d-flex justify-content-end'>
                        <Button disabled={!activeUser} className='mx-2' type='submit'>Publish</Button>
                        <Button disabled={!activeUser} className='mx-2'onClick={handleSubmit(data => SubmitDraft(data, canvasRef))}>Save Draft</Button>
                        <Button className='mx-2' onClick={handleSubmit(data => SubmitDownload(data, canvasRef))}>Download</Button>
                    </Form.Group>
                    {/* not a very clean way to handle having multiple submits with react-hook-form but it works */}
                    {/* i would normally have the event check what element submitted it but that isn't in data */}
                </Form>
        </Container> 
    ); 
}

export default DrawNew;