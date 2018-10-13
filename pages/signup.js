import Signup from '../components/Signup'
import Signin from '../components/Signin'
import styled from 'styled-components'

const SignupPage = props => (
  <Columns>
    <Signup />
    <Signin />
    <Signup />
  </Columns>
)

const Columns = styled.div`
   display: grid;
   grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
   grid-gap: 20px;
`

export default SignupPage