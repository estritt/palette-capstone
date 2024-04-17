import { Container, Image, Row, Col, Button, Card, Form } from 'react-bootstrap';
import { useForm, Controller } from 'react-hook-form';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';

function Login() {

    const { activeUser, login, logout } = useAuth();
    const {setError, handleSubmit, control, reset, formState: {errors}, getValues                      
    } = useForm();
    const navigate = useNavigate();

    const onSubmit = async (data) => {
        // console.log(data);
        await login(...Object.values(data)) // might be better to have login take a dictionary
        // .then(navigate(`/profile/${activeUser.url.self.slice(-1)}`));
        // the above would run before activeUser was set and break so I just replaced the render for when user is active
        // this page isn't meant to handle logouts anyways, it was just in case
    }

    if (activeUser) { navigate(`/profile/${activeUser.url.self.slice(-1)}`); 
        // return (
        //     <Container className='p-6'>
        //         <div className='border border-3 border-secondary square rounded-2 p-5 mb-5' style={{'backgroundColor': 'var(--background)'}}>
        //             <p className='mx-auto'>
        //                 You are already logged in! Do you mean to logout? 
        //             </p>
        //             <Button onClick={logout}>Logout</Button>
        //         </div>
        //     </Container>
        // )
    }

    return (
        <Container style={{ width: '600px' }} className='p-6'>
            <Form onSubmit={handleSubmit(onSubmit)} onReset={reset} className='border border-3 border-secondary square rounded-2 p-5 mb-5' style={{'backgroundColor': 'var(--background)'}}>
                <Form.Group className='mb-3' controlId='username'>
                    <Form.Label>Username</Form.Label>
                    {/* <Form.Control (bootstrap)> or <Controller (hook-form)> */}
                    <Controller
                        control={control}
                        name='username'
                        defaultValue=''
                        render={({field: { onChange, onBlur, value, ref }}) => (
                            <Form.Control 
                                onChange={onChange} value={value} ref={ref}
                                // isInvalid={errors.username}
                                placeholder='username' 
                            />
                        )}
                    />
                </Form.Group>
                <Form.Group className='mb-3' controlID='password'>
                    <Form.Label>Password</Form.Label>
                    <Controller
                        control={control}
                        name='password'
                        defaultValue=''
                        render={({field: { onChange, onBlur, value, ref }}) => (
                            <Form.Control 
                                onChange={onChange} value={value} ref={ref}
                                // isInvalid={errors.username}
                                placeholder='password' 
                            />
                        )}
                    />
                </Form.Group>
                <div className='d-flex justify-content-center'><Button type='submit'>Login</Button></div>
                
            </Form>
        </Container>
    );

}

export default Login;