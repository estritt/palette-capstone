import { Container, Image, Row, Col, Button, Card, Form } from 'react-bootstrap';
import { useForm, Controller } from 'react-hook-form';
import { useAuth } from './AuthContext';
// import { Form } from 'react-router-dom'; //wrong form component! 

function Login() {

    const { activeUser, login, logout } = useAuth();
    const {setError, handleSubmit, control, reset, formState: {errors}, getValues                      
    } = useForm();

    function onSubmit(data) {
        console.log(data);
        login(...Object.values(data)); // might be better to have login take a dictionary
    }

    if (activeUser) {
        return (
            <Container fluid className='p-6'>
                <div className='border border-3 border-secondary square rounded-2 p-5 mb-5'>
                    <p className='mx-auto'>
                        You are already logged in! Do you mean to logout? 
                    </p>
                    <Button onClick={logout}>Logout</Button>
                </div>
            </Container>
        )
    }

    return (
        <Container fluid className='p-6'>
            <Form onSubmit={handleSubmit(onSubmit)} onReset={reset} className='border border-3 border-secondary square rounded-2 p-5 mb-5'>
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
                <Button type='submit'>Login</Button>
            </Form>
        </Container>
    );

}

export default Login;