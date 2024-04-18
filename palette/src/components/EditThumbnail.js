import { useEffect, useState } from "react";

// this is only different from ArtThumbnail in that it links create instead of post
// merging the components and giving them an additional argument could be better

function EditThumbnail(path, title) {
    // console.log('path: ' + path.path)
    // Not sure why i need path.path and not just path
    // the json response has "artwork_path": "test.jpg

    const [ imageURL, setImageURL ] = useState('');

    useEffect(() => {  // i could do this without fetching if i just accessed the directory,,
        fetch(`/images/artworks/${path.path}`)
        .then(response => response.blob())
        .then(blob => setImageURL(URL.createObjectURL(blob)));
    }, []);

    // console.log('url: ' + imageURL)

    return (
        <a className='d-flex justify-content-center' href={'/create/' + path.path.substring(0, path.path.length - 4)} > {/* clumsy way to remove .jpg */}
            <img 
                style={{'backgroundColor': 'white'}} //this is a quick fix for how many transparent images there are
                src = {imageURL}
                alt = {title}
                className = 'img-fluid'
                width = {200}
                // onClick = {}
            />
        </a>
    )

}

export default EditThumbnail;