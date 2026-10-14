import NotOnProgramme from '../components/NotOnProgramme';
import useDocumentTitle from '../../controllers/useDocumentTitle';

const NotFoundPage=()=>{
    useDocumentTitle('Not on the programme');
    return <NotOnProgramme/>;
};

export default NotFoundPage;
