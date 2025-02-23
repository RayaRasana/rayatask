import React, { useState } from 'react';
import DatePicker from 'react-multi-date-picker';
import persian from "react-date-object/calendars/persian"
import persian_fa from "react-date-object/locales/persian_fa"
import TimePicker from "react-multi-date-picker/plugins/time_picker";

function DateInput({value, setValue}) {
  console.log(value);
  return (
    <>
    <DatePicker value={value} calendar={persian} onChange={setValue} locale={persian_fa} format="DD MMMM YYYY | HH:mm" plugins={[
      <TimePicker position="left" hideSeconds/>
    ]} />
    </>
  );
}

export default DateInput;
