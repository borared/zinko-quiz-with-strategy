"use client";
import React from 'react';
import { QUESTION_TYPES, QUESTION_TYPE_OPTIONS } from '@/lib/questionTypes';
import CreatorSelectPicker from './CreatorSelectPicker';

export default function QuestionTypePicker({ value, onChange }) {
  return (
    <CreatorSelectPicker
      value={value || QUESTION_TYPES.MULTIPLE_CHOICE}
      onChange={onChange}
      options={QUESTION_TYPE_OPTIONS}
      className="-mt-1"
    />
  );
}