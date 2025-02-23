import React, {
  useCallback, useEffect, useMemo, useRef,
  useState,
} from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Button, Form } from 'semantic-ui-react';
import DateInput from './DateInput';
import { useDidUpdate, useToggle } from '../../lib/hooks';
import { Input, Popup } from '../../lib/custom-ui';

import { useForm } from '../../hooks';
import parseTime from '../../utils/parse-time';

import styles from './DueDateEditStep.module.scss';

const DueDateEditStep = React.memo(({
  defaultValue, onUpdate, onBack, onClose,
}) => {
  const [t] = useTranslation();

  const [data, handleFieldChange, setData] = useForm(() => {
    const date = defaultValue || new Date(new Date().setHours(12, 0, 0, 0) + 24 * 60 * 60 * 1000);

    return {
      date: t('format:date', {
        postProcess: 'formatDate',
        value: date,
      }),
      time: t('format:time', {
        postProcess: 'formatDate',
        value: date,
      }),
    };
  });

  const [selectTimeFieldState, selectTimeField] = useToggle();
  const [multiDatePicker, setMultiDatePicker] = useState(null); // Initialize as null
  const dateField = useRef(null);
  const timeField = useRef(null);

  // Parse the date and time from the `data` state
  const parsedDate = useMemo(() => {
    const date = t('format:date', {
      postProcess: 'parseDate',
      value: data.date,
    });

    if (Number.isNaN(date.getTime())) {
      return null;
    }

    return date;
  }, [data.date, t]);

  const parsedTime = useMemo(() => {
    const time = t('format:time', {
      postProcess: 'parseDate',
      value: data.time,
    });

    if (Number.isNaN(time.getTime())) {
      return null;
    }

    return time;
  }, [data.time, t]);

  // Synchronize `multiDatePicker` with `data.date` and `data.time`
  useEffect(() => {
    if (parsedDate && parsedTime) {
      const combinedDate = new Date(parsedDate);
      const hours = parsedTime.getHours();
      const minutes = parsedTime.getMinutes();
      const seconds = parsedTime.getSeconds();

      combinedDate.setHours(hours, minutes, seconds);
      setMultiDatePicker(combinedDate);
    }
  }, [parsedDate, parsedTime]);

  // Handle changes from the DateInput component
  const handleMultiDatePickerChange = useCallback(
    (date) => {
      setMultiDatePicker(date);

      // Format the date and time
      const formattedDate = t('format:date', {
        postProcess: 'formatDate',
        value: date.toDate(),
      });

      const formattedTime = t('format:time', {
        postProcess: 'formatDate',
        value: date.toDate(),
      });

      // Update both date and time in the form data
      setData((prevData) => ({
        ...prevData,
        date: formattedDate,
        time: formattedTime,
      }));

      selectTimeField();
    },
    [setData, selectTimeField, t],
  );

  const handleSubmit = useCallback(() => {
    if (!parsedDate) {
      dateField.current.select();
      return;
    }

    let value = t('format:dateTime', {
      postProcess: 'parseDate',
      value: `${data.date} ${data.time}`,
    });

    if (Number.isNaN(value.getTime())) {
      value = parseTime(data.time, parsedDate);

      if (Number.isNaN(value.getTime())) {
        timeField.current.select();
        return;
      }
    }

    if (!defaultValue || value.getTime() !== defaultValue.getTime()) {
      onUpdate(value);
    }

    onClose();
  }, [defaultValue, onUpdate, onClose, data, parsedDate, t]);

  const handleClearClick = useCallback(() => {
    if (defaultValue) {
      onUpdate(null);
    }

    onClose();
  }, [defaultValue, onUpdate, onClose]);

  useEffect(() => {
    dateField.current.select();
  }, []);

  useDidUpdate(() => {
    timeField.current.select();
  }, [selectTimeFieldState]);

  useEffect(() => {
    console.log(multiDatePicker?.toDate?.().toString());
  }, [multiDatePicker]);

  return (
    <>
      <Popup.Header onBack={onBack}>
        {t('common.editDueDate', {
          context: 'title',
        })}
      </Popup.Header>
      <Popup.Content>
        <Form onSubmit={handleSubmit}>
          <div className={styles.fieldWrapper}>
            <div className={styles.fieldBox}>
              <div className={styles.text}>{t('common.date')}</div>
              <Input ref={dateField} name="date" value={data.date} onChange={handleFieldChange} />
            </div>
            <div className={styles.fieldBox}>
              <div className={styles.text}>{t('common.time')}</div>
              <Input ref={timeField} name="time" value={data.time} onChange={handleFieldChange} />
            </div>
          </div>
          <DateInput value={multiDatePicker} setValue={handleMultiDatePickerChange} />
          <Button positive content={t('action.save')} />
        </Form>
        <Button
          negative
          content={t('action.remove')}
          className={styles.deleteButton}
          onClick={handleClearClick}
        />
      </Popup.Content>
    </>
  );
});

DueDateEditStep.propTypes = {
  defaultValue: PropTypes.instanceOf(Date),
  onUpdate: PropTypes.func.isRequired,
  onBack: PropTypes.func,
  onClose: PropTypes.func.isRequired,
};

DueDateEditStep.defaultProps = {
  defaultValue: undefined,
  onBack: undefined,
};

export default DueDateEditStep;
