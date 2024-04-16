import { useContext, useEffect, useRef, useState } from 'react';
import { Container, Row, Col, Button, Card, Form } from 'react-bootstrap';
import { useForm, Controller } from 'react-hook-form';

import DrawMenu from "./DrawMenu";
import { AuthProvider } from './AuthContext';

function DrawEdit({ filename }) {

    const [ post, setPost ] = useState(null);
    const [ owns, setOwns ] = useState(true);
    const [ wrongName, setWrongName ] = useState(false); //this assumes 500 errors are from a missing file when they could be from lots of things like the server being down
    
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

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d'); 
        fetch(`/drafts/${filename}.jpg`)
        .then(response => {if (response.ok || response.status == 304) {
            setOwns(true);
            response.json()
            .then(data => {
                setPost(data);
                fetch(`/images/artworks/${data.artwork_path}`)
                .then(response => response.blob())
                .then(blob => {
                    const image = new Image(); //careful - importing Image from react-bootstrap makes this break
                    image.onload = () => {
                        canvas.width = image.width;
                        canvas.height = image.height;
                        ctx.drawImage(image,0,0); // can set bottom right corner with next two args
                    } 
                    image.src = URL.createObjectURL(blob);
                });
            })
        } else {
            setOwns(false);
            if (response.status == 500) {setWrongName(true);}
        }})
    }, []);

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

    function SubmitPublish(data) {
        console.log('publish clicked:')
        console.log(data);
        // console.log(data.nativeEvent.submitter.name)
    }

    function SubmitDraft(data) {
        console.log('draft clicked:');
        console.log(data)
    }

    if (wrongName) {return <Container>Wrong file name!<canvas ref={canvasRef} /></Container>;}

    if (!owns) {return <Container>This isn't your image!<canvas ref={canvasRef} /></Container>;}

    

    return ( // using rows causes the brush to be offset from the cursor
        <Container fluid className='p-6'> 
            <div className='border border-3 border-secondary square rounded-2 p-5 mb-5 ' style={{'backgroundColor': '#ECECEC'}}> 
                <DrawMenu 
                    setPrimaryColor={setPrimaryColor} 
                    setLineWidth={setLineWidth} 
                    setLineOpacity={setLineOpacity} 
                /> 
                <div className='justify-content-center d-flex'>
                    <canvas 
                        onMouseDown={startDrawing} 
                        onMouseUp={endDrawing} 
                        onMouseMove={draw} 
                        ref={canvasRef} 
                    /> 
                </div>
            </div>
            {(post) ? 
                <Form onSubmit={handleSubmit(SubmitPublish)} onReset={reset} className='border border-3 border-secondary square rounded-2 p-5 mb-5' style={{'backgroundColor': '#ECECEC'}}>
                    <Form.Group className='mb-3' controlId='username'>
                        <Form.Label>Title</Form.Label>
                        <Controller 
                            control={control}
                            name='title'
                            defaultValue={post.title}
                            render={({field: { onChange, onBlur, value, ref }}) => (
                                <Form.Control 
                                    onChange={onChange} value={value} ref={ref}
                                    // isInvalid={errors.username}
                                    placeholder='username' 
                                />
                            )}
                        />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Body</Form.Label>
                            <Controller 
                                control={control}
                                name='body'
                                defaultValue={post.body}
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
                    <Button type='submit'>Publish</Button>
                    <Button onClick={handleSubmit(SubmitDraft)}>Save Draft</Button>
                    {/* not a very clean way to handle having two submits with react-hook-form but it works */}
                    {/* i would normally have the event check what element submitted it but that isn't in data */}
                </Form>
            : <></>} 
        </Container> 
    ); 
}

export default DrawEdit;