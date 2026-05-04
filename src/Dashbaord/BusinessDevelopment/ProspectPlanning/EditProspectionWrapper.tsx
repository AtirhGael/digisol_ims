import { useNavigate, useParams } from 'react-router-dom';
import { EditProspectionPlan } from './EditProspection';

export const EditProspectionWrapper = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const handleCancel = () => {
    navigate('/dashboard/prospectionplanning');
  };

  if (!id) {
    navigate('/dashboard/prospectionplanning');
    return null;
  }

  return <EditProspectionPlan onCancel={handleCancel} editId={id} />;
};