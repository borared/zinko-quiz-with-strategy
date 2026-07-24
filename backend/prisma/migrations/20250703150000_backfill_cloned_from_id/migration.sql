-- Link existing clones (created before cloned_from_id) to their source public quiz by title.
UPDATE quizzes AS clone
SET cloned_from_id = original.id
FROM quizzes AS original
WHERE clone.is_cloned = true
  AND clone.cloned_from_id IS NULL
  AND clone.title = original.title || ' (Clone)'
  AND original.is_public = true
  AND original.creator_id <> clone.creator_id
  AND original.id <> clone.id;