import Modal from "./Modal";
import FormActions from "./FormActions";

export default function CrudFormModal({
  title,
  onClose,
  onSubmit,
  saving,
  isEdit,
  children,
}) {
  return (
    <Modal title={title} onClose={onClose}>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        {children}
        <FormActions saving={saving} isEdit={isEdit} onCancel={onClose} />
      </form>
    </Modal>
  );
}
