import React, { useState, useEffect } from 'react';
import { FaEdit } from 'react-icons/fa';
import { motion } from 'framer-motion';
import styles from './ProfileView.module.css';
import { User } from '../../types/user';

interface ProfileViewProps {
  profile: User;
  additionalInfo: any;
  onEditClick: () => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ profile, additionalInfo, onEditClick }) => {
  const [resolvedPhotos, setResolvedPhotos] = useState<string[]>([]);
  
  // Resolve photo references from sessionStorage
  useEffect(() => {
    if (profile.photos) {
      const photos = [...profile.photos];
      
      // Check if photos are references to sessionStorage
      for (let i = 0; i < photos.length; i++) {
        if (photos[i] && photos[i].startsWith('profile_photo_')) {
          // Retrieve the actual photo data from sessionStorage
          const photoData = sessionStorage.getItem(photos[i]);
          if (photoData) {
            photos[i] = photoData;
          }
        }
      }
      
      setResolvedPhotos(photos);
    }
  }, [profile.photos]);
  // Animation variants from CreationForm
  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className={styles.profileCreationContainer}>
      {/* Header */}
      <motion.h1 
        className={styles.formTitle}
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        Your Profile
      </motion.h1>
      <motion.p 
        className={styles.formSubtitle}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.2 }}
      >
        Looking good! Here's your profile as others will see it.
      </motion.p>
      
      {/* Profile Photo */}
      <motion.div 
        className={styles.glassCard}
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.3 }}
      >
        <div className={styles.cardHeader}>
          <h2 className={styles.sectionTitle}>Your Profile Photo</h2>
          <button 
            className={styles.editButton}
            onClick={onEditClick}
          >
            <FaEdit /> Edit Profile
          </button>
        </div>

        <div className={styles.profilePhotoDisplay}>
          {resolvedPhotos[0] ? (
            <img 
              src={resolvedPhotos[0]} 
              alt="Profile" 
              className={styles.mainPhotoPreview} 
            />
          ) : (
            <div className={styles.photoPlaceholder}>
              <div className={styles.photoUploadIcon}>
                No photo
              </div>
            </div>
          )}
        </div>
      </motion.div>
      
      {/* Additional Photos */}
      <motion.div 
        className={styles.glassCard}
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.4 }}
      >
        <h2 className={styles.sectionTitle}>Your Photos</h2>
        <div className={styles.additionalPhotosGrid}>
          {resolvedPhotos.slice(1).filter(Boolean).map((photo, index) => (
            <div key={index} className={styles.additionalPhotoItem}>
              <img src={photo} alt={`Photo ${index + 2}`} />
            </div>
          ))}
        </div>
      </motion.div>
      
      {/* Basic Information */}
      <motion.div 
        className={styles.glassCard}
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.5 }}
      >
        <div className={styles.cardHeader}>
          <h2 className={styles.sectionTitle}>Basic Information</h2>
          <button 
            className={styles.editButton}
            onClick={onEditClick}
          >
            <FaEdit /> Edit
          </button>
        </div>
        
        <div className={styles.formRow}>
          <div className={styles.formField}>
            <div className={styles.fieldLabel}>Name</div>
            <div className={styles.fieldValue}>{profile.name}</div>
          </div>
          
          <div className={styles.formField}>
            <div className={styles.fieldLabel}>Age</div>
            <div className={styles.fieldValue}>{profile.age}</div>
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formField}>
            <div className={styles.fieldLabel}>Gender</div>
            <div className={styles.fieldValue}>{profile.gender}</div>
          </div>
          
          <div className={styles.formField}>
            <div className={styles.fieldLabel}>Sexuality</div>
            <div className={styles.fieldValue}>{additionalInfo.sexuality || 'Not specified'}</div>
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formField}>
            <div className={styles.fieldLabel}>Height</div>
            <div className={styles.fieldValue}>{additionalInfo.height ? `${additionalInfo.height} cm` : 'Not specified'}</div>
          </div>
          
          <div className={styles.formField}>
            <div className={styles.fieldLabel}>Weight</div>
            <div className={styles.fieldValue}>{additionalInfo.weight ? `${additionalInfo.weight} kg` : 'Not specified'}</div>
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formField}>
            <div className={styles.fieldLabel}>Marital Status</div>
            <div className={styles.fieldValue}>{additionalInfo.maritalStatus || 'Not specified'}</div>
          </div>
          
          <div className={styles.formField}>
            <div className={styles.fieldLabel}>Body Type</div>
            <div className={styles.fieldValue}>{additionalInfo.bodyType || 'Not specified'}</div>
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formField}>
            <div className={styles.fieldLabel}>Religion</div>
            <div className={styles.fieldValue}>{additionalInfo.religion || 'Not specified'}</div>
          </div>
          
          <div className={styles.formField}>
            <div className={styles.fieldLabel}>Ethnicity</div>
            <div className={styles.fieldValue}>{additionalInfo.ethnicity || 'Not specified'}</div>
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formField}>
            <div className={styles.fieldLabel}>Location</div>
            <div className={styles.fieldValue}>{profile.location.city}, {profile.location.state}</div>
          </div>
          
          {additionalInfo.pronouns && (
            <div className={styles.formField}>
              <div className={styles.fieldLabel}>Pronouns</div>
              <div className={styles.fieldValue}>{additionalInfo.pronouns}</div>
            </div>
          )}
        </div>
      </motion.div>
        
      {/* Looking For */}
      {additionalInfo.lookingFor && additionalInfo.lookingFor.length > 0 && (
        <motion.div 
          className={styles.glassCard}
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.6 }}
        >
          <h2 className={styles.sectionTitle}>Looking For</h2>
          <div className={styles.optionTabs}>
            {additionalInfo.lookingFor.map((item: string, index: number) => (
              <button key={index} className={`${styles.optionTab} ${styles.active}`}>
                {item}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* About Me */}
      {profile.bio && (
        <motion.div 
          className={styles.glassCard}
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.7 }}
        >
          <h2 className={styles.sectionTitle}>About Me</h2>
          <div className={styles.bioContainer}>
            {profile.bio}
          </div>
        </motion.div>
      )}
      
      {/* Interests */}
      {profile.interests && profile.interests.length > 0 && (
        <motion.div 
          className={styles.glassCard}
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.8 }}
        >
          <h2 className={styles.sectionTitle}>Interests</h2>
          <div className={styles.interestsContainer}>
            {profile.interests.map((interest, index) => (
              <button key={index} className={`${styles.optionTab} ${styles.active}`}>
                {interest}
              </button>
            ))}
          </div>
        </motion.div>
      )}
        
      {/* Education & Work */}
      {(additionalInfo.education || additionalInfo.job || additionalInfo.jobTitle || additionalInfo.degree) && (
        <motion.div 
          className={styles.glassCard}
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.9 }}
        >
          <h2 className={styles.sectionTitle}>Education & Work</h2>
          
          {additionalInfo.education && (
            <div className={styles.formRow}>
              <div className={styles.formField}>
                <div className={styles.fieldLabel}>Education</div>
                <div className={styles.fieldValue}>{additionalInfo.education}</div>
              </div>
            </div>
          )}
          
          {additionalInfo.degree && (
            <div className={styles.formRow}>
              <div className={styles.formField}>
                <div className={styles.fieldLabel}>Degree</div>
                <div className={styles.fieldValue}>{additionalInfo.degree}</div>
              </div>
            </div>
          )}
          
          {additionalInfo.job && (
            <div className={styles.formRow}>
              <div className={styles.formField}>
                <div className={styles.fieldLabel}>Profession</div>
                <div className={styles.fieldValue}>{additionalInfo.job}</div>
              </div>
            </div>
          )}
          
          {additionalInfo.jobTitle && (
            <div className={styles.formRow}>
              <div className={styles.formField}>
                <div className={styles.fieldLabel}>Job Title</div>
                <div className={styles.fieldValue}>{additionalInfo.jobTitle}</div>
              </div>
            </div>
          )}
        </motion.div>
      )}
      
      {/* Languages */}
      {additionalInfo.languages && additionalInfo.languages.length > 0 && (
        <motion.div 
          className={styles.glassCard}
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 1.0 }}
        >
          <h2 className={styles.sectionTitle}>Languages</h2>
          <div className={styles.optionTabs}>
            {additionalInfo.languages.map((language: string, index: number) => (
              <button key={index} className={`${styles.optionTab} ${styles.active}`}>
                {language}
              </button>
            ))}
          </div>
        </motion.div>
      )}
        
      {/* Lifestyle */}
      <motion.div 
        className={styles.glassCard}
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 1.1 }}
      >
        <h2 className={styles.sectionTitle}>Lifestyle & Personal Details</h2>
        
        {additionalInfo.drinking && (
          <div className={styles.formRow}>
            <div className={styles.formField}>
              <div className={styles.fieldLabel}>Drinking</div>
              <div className={styles.fieldValue}>{additionalInfo.drinking}</div>
            </div>
          </div>
        )}
        
        {additionalInfo.smoking && (
          <div className={styles.formRow}>
            <div className={styles.formField}>
              <div className={styles.fieldLabel}>Smoking</div>
              <div className={styles.fieldValue}>{additionalInfo.smoking}</div>
            </div>
          </div>
        )}
        
        {additionalInfo.religion && (
          <div className={styles.formRow}>
            <div className={styles.formField}>
              <div className={styles.fieldLabel}>Religion</div>
              <div className={styles.fieldValue}>{additionalInfo.religion}</div>
            </div>
          </div>
        )}
        
        {additionalInfo.diet && (
          <div className={styles.formRow}>
            <div className={styles.formField}>
              <div className={styles.fieldLabel}>Diet</div>
              <div className={styles.fieldValue}>{additionalInfo.diet}</div>
            </div>
          </div>
        )}
        
        {additionalInfo.sleepSchedule && (
          <div className={styles.formRow}>
            <div className={styles.formField}>
              <div className={styles.fieldLabel}>Sleep Schedule</div>
              <div className={styles.fieldValue}>{additionalInfo.sleepSchedule}</div>
            </div>
          </div>
        )}
        
        {additionalInfo.fitnessLevel && (
          <div className={styles.formRow}>
            <div className={styles.formField}>
              <div className={styles.fieldLabel}>Fitness Level</div>
              <div className={styles.fieldValue}>{additionalInfo.fitnessLevel}</div>
            </div>
          </div>
        )}

        {additionalInfo.workLifeBalance && (
          <div className={styles.formRow}>
            <div className={styles.formField}>
              <div className={styles.fieldLabel}>Work-Life Balance</div>
              <div className={styles.fieldValue}>{additionalInfo.workLifeBalance}</div>
            </div>
          </div>
        )}

        {additionalInfo.livingSituation && (
          <div className={styles.formRow}>
            <div className={styles.formField}>
              <div className={styles.fieldLabel}>Living Situation</div>
              <div className={styles.fieldValue}>{additionalInfo.livingSituation}</div>
            </div>
          </div>
        )}

        {additionalInfo.travelPreference && (
          <div className={styles.formRow}>
            <div className={styles.formField}>
              <div className={styles.fieldLabel}>Travel Preference</div>
              <div className={styles.fieldValue}>{additionalInfo.travelPreference}</div>
            </div>
          </div>
        )}

        {additionalInfo.zodiac && (
          <div className={styles.formRow}>
            <div className={styles.formField}>
              <div className={styles.fieldLabel}>Zodiac</div>
              <div className={styles.fieldValue}>{additionalInfo.zodiac}</div>
            </div>
          </div>
        )}
        
        {additionalInfo.pets && (
          <div className={styles.formRow}>
            <div className={styles.formField}>
              <div className={styles.fieldLabel}>Pets</div>
              <div className={styles.fieldValue}>{additionalInfo.pets}</div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Additional text descriptions */}
      {additionalInfo.interestsDescription && (
        <motion.div 
          className={styles.glassCard}
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 1.3 }}
        >
          <h2 className={styles.sectionTitle}>About My Interests</h2>
          <div className={styles.bioContainer}>
            {additionalInfo.interestsDescription}
          </div>
        </motion.div>
      )}

      {additionalInfo.dreams && (
        <motion.div 
          className={styles.glassCard}
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 1.4 }}
        >
          <h2 className={styles.sectionTitle}>Dreams & Aspirations</h2>
          <div className={styles.bioContainer}>
            {additionalInfo.dreams}
          </div>
        </motion.div>
      )}

      {additionalInfo.languagesLearning && (
        <motion.div 
          className={styles.glassCard}
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 1.5 }}
        >
          <h2 className={styles.sectionTitle}>Languages I'm Learning</h2>
          <div className={styles.bioContainer}>
            {additionalInfo.languagesLearning}
          </div>
        </motion.div>
      )}
      
      {/* Work-Life Balance */}
      {additionalInfo.workLifeBalance && (
        <motion.div 
          className={styles.glassCard}
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 1.6 }}
        >
          <h2 className={styles.sectionTitle}>Work-Life Balance</h2>
          <div className={styles.fieldValue}>
            {additionalInfo.workLifeBalance}
          </div>
        </motion.div>
      )}
      
      {/* Living Situation */}
      {additionalInfo.livingSituation && (
        <motion.div 
          className={styles.glassCard}
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 1.7 }}
        >
          <h2 className={styles.sectionTitle}>Living Situation</h2>
          <div className={styles.fieldValue}>
            {additionalInfo.livingSituation}
          </div>
        </motion.div>
      )}
      
      {/* Travel Preference */}
      {additionalInfo.travelPreference && (
        <motion.div 
          className={styles.glassCard}
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 1.8 }}
        >
          <h2 className={styles.sectionTitle}>Travel Preference</h2>
          <div className={styles.fieldValue}>
            {additionalInfo.travelPreference}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ProfileView;
