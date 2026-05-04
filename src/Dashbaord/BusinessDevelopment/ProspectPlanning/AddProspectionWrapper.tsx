import { useNavigate } from 'react-router-dom';
import { NewProspectionPlan } from './AddProspection';

export const AddProspectionWrapper = () => {
  const navigate = useNavigate();

  const handleCancel = () => {
    navigate('/dashboard/prospectionplanning');
  };

  return <NewProspectionPlan onCancel={handleCancel} />;
};