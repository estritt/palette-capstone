import { useContext, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom'
import DrawEdit from './DrawEdit.js'
import DrawNew from './DrawNew.js'

// the basics of the canvas and brush tool (with opacity) are from geeksforgeeks
// i ran into a lot of trouble with conditionally rendering canvas elements so instead i made more components

function Create() {

    const filename = useParams().artworkURL; // undefined when uri has no matching param

    return (
        <> 
            {filename ? <DrawEdit filename={filename} /> : <DrawNew />}
        </>
    )

}

export default Create;