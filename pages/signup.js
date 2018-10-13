import Signup from '../components/Signup'
import styled from 'styled-components'

const SignupPage = props => (
  <Columns>
    <Signup />
    <Signup />
    <Signup />
  </Columns>
)

const Columns = styled.div`
   display: grid;
   grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
   grid-gap: 20px;
`

export default SignupPage