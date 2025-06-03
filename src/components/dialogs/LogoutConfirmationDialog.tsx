import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './DialogStyle.module.css';

interface LogoutConfirmationDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const LogoutConfirmationDialog: React.FC<LogoutConfirmationDialogProps> = ({
  isOpen,
  onConfirm,
  onCancel
}) => {
  // Close on Escape key press
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onCancel();
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onCancel]);
  
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div 
            className={styles.backdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
          />
          
          {/* Dialog */}
          <motion.div 
            className={styles.dialog}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          >
            <h2 className={styles.title}>Log Out</h2>
            <p className={styles.message}>
              Are you sure you want to log out?
            </p>
            
            <div className={styles.buttonGroup}>
              <button 
                className={`${styles.button} ${styles.cancelButton}`}
                onClick={onCancel}
              >
                Cancel
              </button>
              <button 
                className={`${styles.button} ${styles.confirmButton}`}
                onClick={onConfirm}
              >
                Log Out
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default LogoutConfirmationDialog;
