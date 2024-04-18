import { Container, Row, Col, Button  } from 'react-bootstrap';
import { useEffect, useState } from 'react';

import { useAuth } from './AuthContext';
import EditThumbnail from './EditThumbnail';

function Drafts() {

    const { activeUser } = useAuth();

    const [ drafts, setDrafts ] = useState(null);
    
    useEffect(() => {
        if (activeUser) {
            fetch(`/drafts/${activeUser.url.self.split("=")[1]}`)
            .then(response => response.json())
            .then(data => setDrafts(data))
        }
    }, [activeUser]); // this dependency handles the initial render, this could probably be avoided by using async

    if (!activeUser) {return <div className='border border-3 border-secondary square rounded-2 p-5 pb-0 mb-5' style={{'backgroundColor': 'var(--background)'}}>Log in first!</div>}

    if (!drafts) {return (<div className='border border-3 border-secondary square rounded-2 p-5 pb-0 mb-5' style={{'backgroundColor': 'var(--background)'}}>
        <p>Waiting...</p>
    </div>)}

    if (Array.isArray(drafts) && !drafts.length) {
        return (
            <Container fluid className='p-6'>
                <div className='d-flex justify-content-center border border-3 border-secondary square rounded-2 p-5' style={{'backgroundColor': 'var(--background)'}}>
                    <div>You have no drafts!</div>
                </div>
            </Container>
        )
    }

    if (drafts.error) {return <div>Not the owner</div>}

    console.log(drafts)
    return (
        <Container fluid className='p-6'>
            <Row className='border border-3 border-secondary square rounded-2 p-5 pb-0 mb-5' style={{'backgroundColor': 'var(--background)'}}>
                {drafts.map(draft => {console.log(JSON.stringify(draft));
                    return (
                        <Col className='pb-5' xs={12} sm={6} md={4} lg={3} key={draft.url.self}>
                            <EditThumbnail path={draft.artwork_path} title={draft.title} />
                        </Col>
                    )
                })}
            </Row>
        </Container>
    )
}

export default Drafts;