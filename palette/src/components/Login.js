import { Container, Image, Row, Col, Button, Card, Form } from 'react-bootstrap';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { useAuth } from './AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
// implement yup at some point

function Login() {

    const { activeUser, login, logout } = useAuth();
    const {setError, handleSubmit, control, reset, formState: {errors}, getValues                      
    } = useForm();
    const password = useWatch({ control, name: 'password' });
    const navigate = useNavigate();
    const [ isSignup, setIsSignup ] = useState(false);
    const { signupParam } = useParams();
    useEffect(() => {
        if (signupParam === 'true') {setIsSignup(true);}
    }, []);
    

    const onSubmit = async (data) => {
        // console.log(data);
        if (isSignup) {
            delete data.confirmPassword;
            fetch('/users', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(data)
            })
            // .then(response => response.json())
            // .then(newUser => navigate(`/profile/${newUser.url.self.split("=")[1]}`))
            .then(() => login(...Object.values(data)))
        } else {login(...Object.values(data))}
        // might be better to have login take a dictionary
        // .then(navigate(`/profile/${activeUser.url.self.split("=")[1]}`));
        // the above would run before activeUser was set and break so I just replaced the render for when user is active
        // this page isn't meant to handle logouts anyways, it was just in case
    }

    if (activeUser) { navigate(`/profile/${activeUser.url.self.split("=")[1]}`); 
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
                        as={<Form.Control type="username" />}
                        control={control}
                        name='username'
                        defaultValue=''
                        rules={{ required: true }}
                        render={({field: { onChange, onBlur, value, ref }}) => (
                            <Form.Control 
                                onChange={onChange} value={value} ref={ref}
                                // isInvalid={errors.username}
                                // placeholder='username' 
                            />
                        )}
                    />
                    {errors.username && <Form.Text>Username is required</Form.Text>}
                </Form.Group>
                <Form.Group className='mb-3' controlID='password'>
                    <Form.Label>Password</Form.Label>
                    <Controller
                        control={control}
                        name='password'
                        defaultValue=''
                        rules={{ required: true }}
                        render={({field: { onChange, onBlur, value, ref }}) => (
                            <Form.Control 
                                onChange={onChange} value={value} ref={ref}
                                // isInvalid={errors.username}
                                // placeholder='password' 
                            />
                        )}
                    />
                    {errors.password && <Form.Text>Password is required</Form.Text>}
                </Form.Group>
                {isSignup &&
                    <Form.Group className='mb-3' controlId='confirmPassword'>
                        <Form.Label>Confirm Password</Form.Label>
                    <Controller
                        control={control}
                        name='confirmPassword'
                        defaultValue=''
                        rules={{ 
                            required: true,
                            validate: (value) => value === password || 'Passwords do not match'
                        }}
                        render={({field: { onChange, onBlur, value, ref }}) => (
                            <Form.Control 
                                onChange={onChange} value={value} ref={ref}
                                // isInvalid={errors.username}
                                // placeholder='confirm password' 
                                // validate= {(val) => {if (watch('password') != val) {return 'no'}}} 
                            />
                        )}
                    />
                    {errors.confirmPassword && (
                        <Form.Text>{errors.confirmPassword.message}</Form.Text>
                    )}
                    </Form.Group>
                }
                <div className='d-flex justify-content-center'><Button type='submit'>Login</Button></div>
                
            </Form>
        </Container>
    );

}

export default Login;