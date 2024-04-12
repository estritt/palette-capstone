import { useEffect, useState } from "react";

function ArtThumbnail(path, title) {
    console.log('path: ' + path.path)
    // i have no idea why i need path.path and not just path
    // the json response has "artwork_path": "test.jpg

    const [ imageURL, setImageURL ] = useState('');

    useEffect(() => {  // i could do this without fetching if i just accessed the directory,,
        fetch(`/images/artworks/${path.path}`)
        .then(response => response.blob())
        .then(blob => setImageURL(URL.createObjectURL(blob)));
    }, []);

    console.log('url: ' + imageURL)

    return (
        // <a href={`/artwork/${id}`}>
        <a href={'post/' + path.path.substring(0, path.path.length - 4)} > {/* clumsy way to remove .jpg */}
            <img 
                src = {imageURL}
                alt = {title}
                className = 'mx-5 img-fluid flex-shrink-0'
                width = {200}
                // onClick = {}
            />
        </a>
    )

}

export default ArtThumbnail;