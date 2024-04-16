import DrawMenu from "./DrawMenu";
import { useContext, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom'

// the basics of the canvas and brush tool (with opacity) are from geeksforgeeks

function Create() {
    
    const filename = useParams().artworkURL; // will be undefined if path includes no param
    const [ post, setPost ] = useState(null);
    const [ editingStatus, setEditingStatus ] = useState({'editing': false, 'owns': true})
    const [ loadedImage, setLoadedImage ] = useState(null);
  
    
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
        if (filename) {
            // setEditingStatus(editingStatus => ({...editingStatus, 'editing': true}));
            console.log(editingStatus);
            console.log('filename: ' + JSON.stringify(filename));
            fetch(`/drafts/${filename}.jpg`)
            // .then(response => response.ok ? response.json() : null)
            .then(response => {if (response.ok || response.status == 304) { 
                response.json()
                .then(data => {
                    setPost(data);
                    fetch(`/images/artworks/${data.artwork_path}`)
                    .then(response => response.blob())
                    .then(blob => {
                        const image = new Image();
                        // image.onload = () => {ctx.drawImage(image,0,0)} // can set bottom right corner with next two args
                        image.src = URL.createObjectURL(blob);
                        setLoadedImage(image);
                        // this onload worked until i added setEditingStatus. then i had to make another state for loadedImage
                    });
                })
            .catch(() => setEditingStatus(editingStatus, {'owns': false}))    
            }})
        }
    }, [ primaryColor, lineOpacity, lineWidth ]);

    useEffect(() => {
        if (loadedImage) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d'); 
            ctxRef.current = ctx;
            ctxRef.current.drawImage(loadedImage, 0, 0); 
        }
      }, [loadedImage]);

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
  
    // using rows and containers causes the brush to be offset from the cursor
    console.log(canvasRef)
    
    // if (!editingStatus.editing) { 
    //     return (<><p>Not editing</p>
    //     <canvas style={{'backgroundColor': 'white'}}
    //     onMouseDown={startDrawing} 
    //     onMouseUp={endDrawing} 
    //     onMouseMove={draw} 
    //     ref={canvasRef} 
    //     width={`1280px`} 
    //     height={`720px`} /></>)
    // }
console.log(loadedImage)
    return ( 
        <> 
            {/* <h1>Paint App</h1>  */}
            {/* {loadedImage ? ( */}
            <div className='draw-areaborder border-3 border-secondary square rounded-2 p-5 mb-5' style={{'backgroundColor': '#ECECEC'}}> 
                <DrawMenu 
                    setPrimaryColor={setPrimaryColor} 
                    setLineWidth={setLineWidth} 
                    setLineOpacity={setLineOpacity} 
                /> 
                <canvas 
                    style={{'backgroundColor': 'white'}}
                    onMouseDown={startDrawing} 
                    onMouseUp={endDrawing}  
                    onMouseMove={draw} 
                    ref={canvasRef} 
                    // width={loadedImage.width + 'px'} 
                    // height={loadedImage.height + 'px'} 
                    width={`1280px`} 
                    height={`720px`}
                /> 
            </div> 
            {/* ) : <canvas style={{'backgroundColor': 'white'}} 
                    onMouseDown={startDrawing} 
                    onMouseUp={endDrawing} 
                    onMouseMove={draw} 
                    ref={canvasRef} 
                    width={`1280px`} 
                    height={`720px`} />} */}
        </> 
    ); 
}

export default Create;