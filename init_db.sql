--Initial postgres table creation script 
\c rules 

DROP TABLE IF EXISTS data_results; 
DROP TABLE IF EXISTS mri_rules; 
DROP TABLE IF EXISTS word_weights; 

CREATE TABLE IF NOT EXISTS mri_rules ( 
    id SERIAL PRIMARY KEY, 
    body_part VARCHAR(32) NOT NULL, 
    body_tokens TSVECTOR, 
    text_val TEXT, 
    weighted_tokens TSVECTOR, 
    priority VARCHAR(3),
    created_on TIMESTAMP
); 

CREATE TABLE IF NOT EXISTS data_results ( 
    cioId INT PRIMARY KEY, 
    rulesId INT, 
    info JSON NOT NULL, 
    contrast BOOLEAN,
    FOREIGN KEY (rulesId) REFERENCES mri_rules(id)
); 

CREATE TABLE IF NOT EXISTS word_weights(
    word VARCHAR(32) PRIMARY KEY, 
    weight VARCHAR(1)
);
-- SELECT * FROM mri_rules; 

INSERT INTO mri_rules(body_part, text_val, priority) VALUES 
('abdomen', 'Abscesses', '3A'),
('abdomen', 'Adrenal mass', '3B'),
('abdomen', 'Aneurysm (Brain and Angio)', '4'),
('abdomen', 'Appendix', '2'),
('abdomen', 'Bowel ischemia (SBFT)', '2'),
('abdomen', 'Characterization soft tissue mass, likely benign (lipoma)', '3B'),
('abdomen', 'Hepatic mass (likely hemangioma FNH)', '3B'),
('abdomen', 'Lesions', '3A'),
('abdomen', 'Liver Cancer staging of new (FU timed or RT)', '3A'),
('abdomen', 'Lymphoma query', '3A'),
('abdomen', 'Metastatic workup rad to decide', '3A'),
('abdomen', 'MRCP (query ca 3A, NYD pain 4)', '3A'),
('abdomen', 'MRCP known', '4'),
('abdomen', 'Pancreas Cancer (rad review)', '3A'),
('abdomen', 'Portal vein Thrombosis', 'RAD'),
('abdomen', 'Renal Cancer  Follow up', '4'),
('abdomen', 'Renal Artery Stenosis', '4'),
('abdomen', 'Renal Cancer Query is semi', '3B'),
('abdomen', 'SBFT  Chrohns (unless clinically Warrants sooner)', '4'),
('abdomen', 'Staging of new cancer', '3A');

INSERT INTO mri_rules(body_part, text_val, priority) VALUES 
('angio', 'Acute carotid or aortic dissection (CT equivocal)', '1'),
('angio', 'Critical / high grade ICA stenosis symptom', '2'),
('angio', 'Glomus Tumor Carotids', '3C'),
('angio', 'MRA vascular rest pain, Claudication', '2'),
('angio', 'MRA vascular gangrene', '1'),
('angio', 'Preoperative assessment of renal vascular invasion by renal cell carcinoma if ultrasound or CT is inconclusive', '2'),
('angio', 'Suspected intracranial vascular lesion', '2'),
('angio', 'Renal artery stenosis', '4'),
('angio', 'Screen Circle of Willis', '4');

INSERT INTO mri_rules(body_part, text_val, priority) VALUES 
('aortic arch and branches', 'Aneurysm (confirmed, enlarging, Preop) F/U Routine)', 'RAD'),
('aortic arch and branches', 'Coarctation', 'RAD'),
('aortic arch and branches', 'Vascular Abnormalities', 'RAD');

INSERT INTO mri_rules(body_part, text_val, priority) VALUES 
('brain / head', 'Acoustic neuroma Known', '4'),
('brain / head', 'Acoustic neuroma Query ',  '3C'),
('brain / head', 'Acute stroke (CT preferred as initial investigation)',  '1'),
('brain / head', 'Aneurysm (Initial)', '3A'),
('brain / head', 'Aneurysm (F/U or screening)', '4'),
('brain / head', 'Any acute hydrocephalus if MRI needed for RX planning (i.e. ventriculostomy)', '1'),
('brain / head', 'Arachnoid cyst ', '4'),
('brain / head', 'Arachnoiditis', '3A'),
('brain / head', 'Arteriovenus malformation (known 3A/Screen)', '3A'),
('brain / head', 'Arteriovenus malformation (f/u)', '4'),
('brain / head', 'Asymmetric sensorineural hearing loss', '4'),
('brain / head', 'Ataxic gait', '4'),
('brain / head', 'Cavernous Malformations (Screen or f/u)', '4'),
('brain / head', 'Characterization soft tissue mass likely benign (lipoma)', '3B'),
('brain / head', 'Cognitive change', '4'),
('brain / head', 'Congenital brain/spine abnormality which is symptomatic', '3C'),
('brain / head', 'Demyelination (like MS)', '3C'),
('brain / head', 'Demyelination (like MS, diagnosis)', '3A'),
('brain / head', 'Grand Mal Seizures, History of', '4'),
('brain / head', 'Grand Mal Seizures, New ', '4'),
('brain / head', 'Head venogram ? new clot benign intracranial hypertention (Tech/Rad review)', '2'),
('brain / head', 'Increased Prolactin level PIT)', '3C'),
('brain / head', 'Intracranial hemorrhageassessment of underlying lesion', '1'),
('brain / head', 'Ischemic optic Neuropathy', '3C'),
('brain / head', 'Know Chiari malformations', '4'),
('brain / head', 'Know Chiari malformations with surgical decompressions (surgical work up 3A)', '3A'),
('brain / head', 'Meningioma Follow up', '4'),
('brain / head', 'Meningioma initial workup', '3B'),
('brain / head', 'Metastatic workup', '3A'),
('brain / head', 'MS Follow up known, ? Query new lesion', '4'),
('brain / head', 'MS Rule out PML', '3B'),
('brain / head', 'MS Initial diagnosis', '3B'),
('brain / head', 'Neurodegenerative/ dementia', '4'),
('brain / head', 'Neurofibroma ', '3C'),
('brain / head', 'Optic Atrophy', '3C'),
('brain / head', 'Optic Neuritis or Neuropathy', '3C'),
('brain / head', 'Orbital Lesion', '3A'),
('brain / head', 'Pituitary adenoma suspected', '3B'),
('brain / head', 'Post concussion syndrome', '4'),
('brain / head', 'Preoperative evaluation of posterior fossa neoplasm, deep supratentorial neoplam, or exclusion of additional metastatic lesions, if CT does not answer these questions.', '1'),
('brain / head', 'Pulsatile tinnitus or tinnitus ', '4'),
('brain / head', 'Retrocochlear disease', '4'),
('brain / head', 'Seizures (followup)', '4'),
('brain / head', 'Seizures NEW symptoms', '3A'),
('brain / head', 'Skull base and nasopharyngeal tumours for further localizaton and surgical planning', '3A'),
('brain / head', 'Skull base and nasopharyngeal tumours for further localizaton and surgical planning (if tumor invading ASAP Priority 2)', '2'),
('brain / head', 'Space occupying lesion (SOL) Known', '3A'),
('brain / head', 'Staging of new cancer', '3A'),
('brain / head', 'Stealth (coordinated with OR date)', 'RAD'),
('brain / head', 'Suspected encephalitis or abscess', '1'),
('brain / head', 'Suspected intracranial lesion (hx)( Rule out 4)', '3A'),
('brain / head', 'Suspected intracranial lesion', '4'),
('brain / head', 'Suspected intracranial venous thrombosis if CTA unavailable or unable to be performed', 'RAD'),
('brain / head', 'TMJ RJH only', '4'),
('brain / head', 'TMJ (lockedthen semi urgent 3A) RJH only', '3A');

INSERT INTO mri_rules(body_part, text_val, priority) VALUES 
('breast', 'Breast implants Usually looking for a leak', '4'),
('breast', 'Breast residual/recurrent disease post Tx','3A'),
('breast', 'Characterization soft tissue mass likely benign (lipoma)', '3B'),
('breast', 'Metastatic workup', '3A'),
('breast', 'Workup of new breast carcinoma', '2');

INSERT INTO mri_rules(body_part, text_val, priority) VALUES 
('cardiac', 'cardiac ARVD', '2'),
('cardiac', 'cardiac viability assessment or mass', '2');

INSERT INTO mri_rules(body_part, text_val, priority) VALUES 
('chest', 'Characterization soft tissue masslikely benign (lipoma)', '3B'),
('chest', 'Metastatic workup', '3A'),
('chest', 'Pancoast tumour', '3A'),
('chest', 'Preoperative assessment of possible mediastinal or chest wall invasion by tumour, CT is inconclusive', 'RAD'),
('chest', 'Preoperative assessment of possible mediastinal or chest wall invasion by tumour', '2'),
('chest', 'Staging of new cancer','3A');

INSERT INTO mri_rules(body_part, text_val, priority) VALUES 
('neck', 'Characterization soft tissue masslikely benign (lipoma)', '3B'),
('neck', 'Metastatic workup', '3A'),
('neck', 'Skull base and nasopharyngeal tumours, for further localization and surgical planning', '2'),
('neck', 'Staging of new cancer (thyroid)', '3A');

INSERT INTO mri_rules(body_part, text_val, priority) VALUES 
('pelvis', 'Anal Fistula', '4'), 
('pelvis', 'Cervical cancer follow up', '4'), 
('pelvis', 'Cervix Cancer staging', '3A'), 
('pelvis', 'Fetal abnormality', '3A'),
('pelvis', 'Fibroids', '4'), 
('pelvis', 'Inguinal Hernia', 'RAD'),
('pelvis', 'Metastatic workup', '3A'),
('pelvis', 'Post UAE (uterine Artery Emblization)', 'RAD'),
('pelvis', 'Prostate CA', '3B'), 
('pelvis', 'Rectal carcinoma new diagnosis or staging', '2'), 
('pelvis', 'Rule out Seminoma (met)', '3A'), 
('pelvis', 'Staging of new cancer', '3A');

INSERT INTO mri_rules(body_part, text_val, priority) VALUES
('spine', 'Acute osteomyelitis', '1'), 
('spine', 'Characterization soft tissue masslikely benign (lipoma)', '3B'), 
('spine', 'Chronic osteomyelitis', '2'), 
('spine', 'Chronic spine pain', '4'), 
('spine', 'Evaluation of spinal cord injury in acute trauma if no bony abnormality is noted, to assess cord injury of compression', '1'), 
('spine', 'Foot Drop', '3A'),
('spine', 'Foot Drop query Tumor', '2'), 
('spine', 'Metastatic workup', '3A'), 
('spine', 'Myelopathy', '2'), 
('spine', 'Neurofibroma', '3A'),
('spine', 'Neurofibromatosis (follow up)', '4'), 
('spine', 'Preoperative evaluation of spinal cord neoplasm', '1'), 
('spine', 'Staging of new cancer', '3A'), 
('spine', 'Sciatica /radiculopathy', '4'), 
('spine', 'SI joints (rheumatology referral only)', '4'),
('spine', 'Spinal Stenosis (ordered by ortho)','3A'),
('spine', 'Spinal Stenosis (ordered by GP)', '4'),
('spine', 'spine Lesion', '3A'), 
('spine', 'spine Query cord impingement', '2'), 
('spine', 'spine root compression poss mass', '3A'), 
('spine', 'Suspicion of spinal osteomyelitis', '2'), 
('spine', 'Syrinx (query)', '3B'),
('spine', 'Syrinx (follow up)', '4'), 
('spine', 'Urinary / bowel incontinence, HX that goes along with a Lumbar spine', '2');

INSERT INTO mri_rules(body_part, text_val, priority) VALUES
('knee', 'ACL Tear (ortho ordered surigical)', '2'), 
('knee', 'ACL Tear (GP)', '4'),
('knee', 'Acute joint injury tendon rupture', '2'),
('knee', 'Acute osteomyelitis', '1'),
('knee', 'Characterization soft tissue mass, likely benign (lipoma)', '3B'),
('knee', 'Chronic joint pain', '4'),
('knee', 'Chronic Osteomyelitis', '2'),
('knee', 'GP knee, acute (new injury)', '3C'), 
('knee', 'GP knee, chronic HX or meniscal tear (not new injury)', '4'), 
('knee', 'Impingement', '4'), 
('knee', 'Joint Injury', '4'),
('knee', 'Locked knee (GP or specialist)', '3A'), 
('knee', 'Metastatic workup', '3A'), 
('knee', 'Orthopedic knee, acute', '3B'), 
('knee', 'Orthopedic knee, chronic', '3C'), 
('knee', 'Orthopedic knee', '3A'), 
('knee', 'Osteochondromas (unless concern clinically)', '4'), 
('knee', 'Primary sarcoma of bone or soft tissue', '2'), 
('knee', 'Strong suspicion of avascular necrosis if plain film, Nuclear Medicine or CT inconclusive', '2');

INSERT INTO mri_rules(body_part, text_val, priority) VALUES
('hip', 'Acute joint injury tendon rupture', '2'),
('hip', 'Acute osteomyelitis', '1'),
('hip', 'Brachail plexus', '4'),
('hip', 'Brachail plexus query tumor', '4'),
('hip', 'Characterization soft tissue mass, likely benign (lipoma)', '3B'),
('hip', 'Chronic joint pain', '4'),
('hip', 'Chronic Osteomyelitis', '2'),
('hip', 'Hip Querym labral tear (arthrogram)', '4'),
('hip', 'Joint Injury', '4'),
('hip', 'Labral tear query', '4'),
('hip', 'Metastatic workup', '3A'), 
('hip', 'Primary sarcoma of bone or soft tissue', '2'), 
('hip', 'R/O occult fractures from ER: Hip', '2'), 
('hip', 'Strong suspicion of avascular necrosis if plain film, Nuclear Medicine or CT inconclusive', '2');

INSERT INTO mri_rules(body_part, text_val, priority) VALUES
('shoulder', 'Acute joint injury tendon rupture', '2'),
('shoulder', 'Acute osteomyelitis', '1'),
('shoulder', 'Brachail plexus', '4'),
('shoulder', 'Brachail plexus query tumor', '4'),
('shoulder', 'Characterization soft tissue mass, likely benign (lipoma)', '3B'),
('shoulder', 'Chronic joint pain', '4'),
('shoulder', 'Chronic Osteomyelitis', '2'),
('shoulder', 'Impingement', '4'),
('shoulder', 'Joint Injury (ie. labrum)', '4'),
('shoulder', 'Labral tear query', '4'),
('shoulder', 'Metastatic workup', '3A'), 
('shoulder', 'Primary sarcoma of bone or soft tissue', '2'), 
('shoulder', 'Rotator cuff query tear', '3C'), 
('shoulder', 'SLAP tear Query (arthrogram)', '4'), 
('shoulder', 'Supraspinatus tendon', '4'), 
('shoulder', 'Strong suspicion of avascular necrosis if plain film, Nuclear Medicine or CT inconclusive', '2');

INSERT INTO mri_rules(body_part, text_val, priority) VALUES
('wrist / hand', 'Acute joint injury tendon rupture', '2'),
('wrist / hand', 'Acute osteomyelitis', '1'),
('wrist / hand', 'Characterization soft tissue mass, likely benign (lipoma)', '3B'),
('wrist / hand', 'Chronic joint pain', '4'),
('wrist / hand', 'Chronic Osteomyelitis', '2'),
('wrist / hand', 'Joint Injury', '4'),
('wrist / hand', 'Metastatic workup', '3A'), 
('wrist / hand', 'Primary sarcoma of bone or soft tissue', '2'), 
('wrist / hand', 'R/O occult fractures from ER: scaphoid', '2'), 
('wrist / hand', 'TFCC (Traingular fibrocartilage complex) wrist tear','4'), 
('wrist / hand', 'Strong suspicion of avascular necrosis if plain film, Nuclear Medicine or CT inconclusive', '2');

INSERT INTO mri_rules(body_part, text_val, priority) VALUES
('foot', 'Acute joint injury tendon rupture', '2'),
('foot', 'Acute osteomyelitis', '1'),
('foot', 'Characterization soft tissue mass, likely benign (lipoma)', '3B'),
('foot', 'Chronic joint pain', '4'),
('foot', 'Chronic Osteomyelitis', '2'),
('foot', 'Foot Query Mortens Neuroma', '4'),
('foot', 'Joint Injury','4'),
('foot', 'Metastatic workup', '3A'), 
('foot', 'Primary sarcoma of bone or soft tissue', '2'), 
('foot', 'Strong suspicion of avascular necrosis if plain film, Nuclear Medicine or CT inconclusive', '2');

INSERT INTO mri_rules(body_part, text_val, priority) VALUES
('c-spine', 'Acute joint injury tendon rupture', '2'),
('c-spine', 'Acute osteomyelitis', '1'),
('c-spine', 'Characterization soft tissue mass, likely benign (lipoma)', '3B'),
('c-spine', 'Chronic joint pain', '4'),
('c-spine', 'Chronic Osteomyelitis', '2'),
('c-spine', 'Brachail plexus', '4'),
('c-spine', 'Brachail plexus query tumor', '4'),
('c-spine', 'Joint Injury', '4'),
('c-spine', 'Metastatic workup', '3A'), 
('c-spine', 'Primary sarcoma of bone or soft tissue', '2'), 
('c-spine', 'Strong suspicion of avascular necrosis if plain film, Nuclear Medicine or CT inconclusive', '2');

INSERT INTO mri_rules(body_part, text_val, priority) VALUES
('elbow', 'Acute joint injury tendon rupture', '2'),
('elbow', 'Acute osteomyelitis', '1'),
('elbow', 'Characterization soft tissue mass, likely benign (lipoma)', '3B'),
('elbow', 'Chronic joint pain', '4'),
('elbow', 'Chronic Osteomyelitis', '2'),
('elbow', 'Joint Injury', '4'),
('elbow', 'Metastatic workup', '3A'), 
('elbow', 'Primary sarcoma of bone or soft tissue', '2'), 
('elbow', 'Strong suspicion of avascular necrosis if plain film, Nuclear Medicine or CT inconclusive', '2');

INSERT INTO mri_rules(body_part, text_val, priority) VALUES
('ankle', 'Acute joint injury/tendon rupture', '2'),
('ankle', 'Acute osteomyelitis', '1'),
('ankle', 'Characterization soft tissue mass, likely benign (lipoma)', '3B'),
('ankle', 'Chronic joint pain', '4'),
('ankle', 'Chronic Osteomyelitis', '2'),
('ankle', 'Joint Injury', '4'),
('ankle', 'Metastatic workup', '3A'), 
('ankle', 'Primary sarcoma of bone or soft tissue', '2'), 
('ankle', 'Strong suspicion of avascular necrosis if plain film, Nuclear Medicine or CT inconclusive', '2');

UPDATE mri_rules 
SET body_tokens = to_tsvector(body_part);

\copy word_weights FROM 'C:\Users\jackhou\Documents\mri_project\mri_app\sandbox\a_keywords.csv' DELIMITER ',' CSV;
\copy word_weights FROM 'C:\Users\jackhou\Documents\mri_project\mri_app\sandbox\b_keywords.csv' DELIMITER ',' CSV;
\copy word_weights FROM 'C:\Users\jackhou\Documents\mri_project\mri_app\sandbox\connectors_keywords.csv' DELIMITER ',' CSV;

UPDATE word_weights
SET word = TRIM(word); 
